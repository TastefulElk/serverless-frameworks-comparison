const aws = require('aws-sdk');

const sns = new aws.SNS();

exports.handler = async (event) => {
  const items = event.Records.map((record) => aws.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage));
  console.log('items to be published', items);
  
  for (const item of items) {
    const params = {
      TopicArn: process.env.TOPIC_ARN,
      Message: JSON.stringify(item),
    };
    await sns.publish(params).promise();
  }
};