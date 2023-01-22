const dynamodb = require('aws-sdk/clients/dynamodb');
const documentClient = new dynamodb.DocumentClient();

exports.handler = async (event) => {
  const item = JSON.parse(event.body);
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: item,
  };

  await documentClient.put(params).promise();
  console.log('item saved successfully');

  return {
    statusCode: 200,
    body: JSON.stringify(item),
  };
};
