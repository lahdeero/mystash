mystash
============

[Mystash @ https://mystash.70511337.xyz/](https://mystash.70511337.xyz/)

[Mystash @ Cloudfront](https://dn422ddfagn9t.cloudfront.net)

## Install development environment

### Backend
- Docker is required
- Serverless is required
- AWS CLI is required

```bash
npm install -g serverless
npm i
aws configure --profile mystashapp-dev
```

Add or update ~/.aws/config
```bash
[default]
s3 =
    endpoint_url = http://localhost:4566
```

## Development

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm start
```

## Debug

List tables
```bash
aws dynamodb list-tables --endpoint-url http://localhost:8001
```

Delete table
```bash
aws dynamodb delete-table --table-name mystash-dev-users --endpoint-url http://localhost:8001
```

List users
```bash
aws dynamodb scan \
    --table-name mystash-dev-users \
    --endpoint-url http://localhost:8001
```

List notes
```bash
aws dynamodb scan \
    --table-name mystash-dev-notes \
    --endpoint-url http://localhost:8001
```

List files
```bash
aws dynamodb scan \
    --table-name mystash-dev-files \
    --endpoint-url http://localhost:8001
```


```bash
aws dynamodb delete-item \
    --table-name mystash-dev-users \
    --key '{"id": {"S": "replace-this-with-real-uuid"}}' \
    --endpoint-url http://localhost:8001
```

```bash
aws dynamodb delete-item \
    --table-name mystash-dev-notes \
    --key '{"id": {"S": "0de4eafa-4752-4535-aab0-79a3a9592b95"}}' \
    --endpoint-url http://localhost:8001
```

```bash
aws --endpoint-url=http://localhost:4566 s3 ls
```

## Deploy

sam local invoke "Register" -e event.json

### Stack AWS CLI

Must install [aws cli](https://aws.amazon.com/cli/) and [cdk](https://github.com/aws/aws-cdk/tree/main) before. If cdk synth gives some docker error make sure esbuild is installed!

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
npm i -g aws-cdk
```

```bash
export AWS_PROFILE=mystashapp-prod
npm ci
aws s3 ls
aws sts get-caller-identity --profile mystashapp-prod
cdk bootstrap aws://AWS-ACCOUNT-ID-HERE/eu-north-1
```

```bash
cd stack
export AWS_PROFILE=mystashapp-prod
cdk synth --profile mystashapp-prod
cdk diff --profile mystashapp-prod
cdk deploy --profile mystashapp-prod
```
