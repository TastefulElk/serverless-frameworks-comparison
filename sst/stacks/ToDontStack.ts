import {
  Api,
  StackContext,
  Table,
  Topic
} from "@serverless-stack/resources";

export function ToDontStack({ stack }: StackContext) {
  // create our SNS topic
  const topic = new Topic(stack, "topic");

  // create our DynamoDB table
  const ddb = new Table(stack, "table", {
    fields: {
      pk: "string",
    },
    primaryIndex: { partitionKey: "pk" },
    stream: "new_and_old_images",
    consumers: {
      fanout: {
        function: {
          handler: "functions/fanout.handler",
          bind: [topic],
        },
      }
    }
  });

  // create our ApiGateway
  const api = new Api(stack, "api", {
    routes: {
      // map POST requests to /item to the persist function
      "POST /item": {
        // create the persist function
        function: {
          handler: "functions/persist.handler",
          bind: [ddb],
        },
      },
    },
  });

  // add a CloudFormation output for the API endpoint
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}