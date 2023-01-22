import { 
  Api,
  Function,
  StackContext,
  Topic 
} from "@serverless-stack/resources";
import { 
  AttributeType,
  BillingMode,
  StreamViewType,
  Table 
} from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { StartingPosition } from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export function ToDontStack({ stack }: StackContext) {  
  // create our DynamoDB table
  const ddb = new Table(stack, "Table", {
    billingMode: BillingMode.PAY_PER_REQUEST,
    partitionKey: {
      name: "pk",
      type: AttributeType.STRING,
    },
    stream: StreamViewType.NEW_AND_OLD_IMAGES,
  });

  // create our SNS topic
  const topic = new Topic(stack, "topic");

  // create our ApiGateway
  const api = new Api(stack, "api", {
    routes: {
      // map POST requests to /item to the persist function
      "POST /item": {
        // create the persist function
        function: {
          handler: "functions/persist.handler",
          // set the DynamoDB table name as an environment variable
          environment: {
            TABLE_NAME: ddb.tableName,
          },
          // grant the function permission to write to the DynamoDB table
          permissions: [new PolicyStatement({
            actions: ["dynamodb:PutItem"],
            resources: [ddb.tableArn]
          })]
        },
      },
    },
  });

  // create our fanout function
  const fanoutFunction = new Function(stack, "fanoutFunction", {
    handler: "functions/fanout.handler",
    // set the SNS Topic ARN as an environment variable
    environment: {
      TOPIC_ARN: topic.topicArn,
    },
    // grant the function permission to publish to the SNS topic
    permissions: [new PolicyStatement({
      resources: [topic.topicArn],
      actions: ["sns:Publish"],
    })]
  });

  // subscribe fanout function to DynamoDB stream
  fanoutFunction.addEventSource(new DynamoEventSource(ddb, {
    startingPosition: StartingPosition.TRIM_HORIZON
  }));

  // add a CloudFormation output for the API endpoint
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
