import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import dynamodb from 'aws-sdk/clients/dynamodb';
const documentClient = new dynamodb.DocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const item = JSON.parse(event.body || '{}');
  const params = {
    TableName: process.env.TABLE_NAME as string,
    Item: item,
  };

  await documentClient.put(params).promise();
  console.log('item saved successfully');

  return {
    statusCode: 200,
    body: JSON.stringify(item),
  };
};
