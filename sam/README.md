# AWS SAM

## Prerequisites

1. Install AWS SAM by following the installation instructions for your platform [here](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html), or if you use Homebrew, run:

  ```bash
  brew tap aws/tap
  brew install aws-sam-cli
  ```

2. Install dependencies with `npm install`.
3. Configure AWS credentials.

## Deployment

To deploy the application, run the following command:

```bash
sam deploy --guided
```

## Testing the application

After successful deployment, you can send a POST HTTP request to the endpoint that was created by the deployment:

```bash
curl --request POST  https://<your API URL>/item -d '{"pk":"12345", "key2":"tiktok"}' -H 'Content-Type: application/json'
```
