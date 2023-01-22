# SST

## Prerequisites

1. Install dependencies with `npm install`.
2. Configure AWS credentials.

## Deployment

To deploy the application, run the following command:

```bash
npm run deploy
```

## Testing the application

After successful deployment, you can send a POST HTTP request to the endpoint that was created by the deployment:

```bash
curl --request POST  https://<your API URL>/item -d '{"pk":"12345", "key2":"tiktok"}' -H 'Content-Type: application/json'
```
