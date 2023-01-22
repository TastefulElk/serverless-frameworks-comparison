import { Construct } from 'constructs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as sns from 'aws-cdk-lib/aws-sns';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ToDontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create our DynamoDB table
    const ddb = new dynamodb.Table(this, 'table', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // Create our SNS topic
    const topic = new sns.Topic(this, 'topic');

    // Create our API Gateway
    const api = new apigateway.RestApi(this, 'api');

    // Create the 'persist' Lambda function
    const persistFunction = new NodejsFunction(this, 'persistFunc', {
      // set the entry point to the function
      entry: path.join(__dirname, '../src/functions/persist.ts'),
      // set the DynamoDB table name as an environment variable
      environment: {
        TABLE_NAME: ddb.tableName,
      },
    });

    // grant the persist function read/write permissions to the DynamoDB table
    ddb.grantReadWriteData(persistFunction);

    // Create the 'fanout' Lambda function
    const fanoutFunction = new NodejsFunction(this, 'fanoutFunction', {
      entry: path.join(__dirname, '../src/functions/fanout.ts'),
      environment: {
        TOPIC_ARN: topic.topicArn,
      },
    });
    // grant the fanout function publish permissions to the SNS topic
    topic.grantPublish(fanoutFunction);

    // grant the fanout function Stream read permissions to the DynamoDB table
    ddb.grantStreamRead(fanoutFunction);

    // Add a DynamoDB stream event source to the fanout function
    fanoutFunction.addEventSourceMapping('mapping', {
      eventSourceArn: ddb.tableStreamArn,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 10,
    });

    // Map the POST /item endpoint to the persist function
    const itemResource = api.root.addResource('item');
    itemResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(persistFunction, { proxy: true }),
    );
  }
}
