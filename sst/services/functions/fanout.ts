import { Topic } from '@serverless-stack/node/topic';
import aws from 'aws-sdk';
import { DynamoDBStreamHandler } from 'aws-lambda';

const sns = new aws.SNS();

export const handler: DynamoDBStreamHandler = async (event) => {
  const items = event.Records.map((record) => record.dynamodb && record.dynamodb.NewImage && aws.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) || undefined).filter((item) => item);
  console.log('items to be published', items);

  for (const item of items) {
    const params = {
      TopicArn: Topic.topic.topicArn,
      Message: JSON.stringify(item),
    };
    await sns.publish(params).promise();
  }
};