mystash
============

[Mystash @ 70511337](https://mystash.70511337.xyz)

[Mystash @ Cloudfront](https://dn422ddfagn9t.cloudfront.net)



## Install development environment

### Backend
- AWS SAM CLI is required
- Docker is required

```bash
npm i
npx tsc
```

```bash
aws dynamodb create-table \
    --table-name mystash-dev-users \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:8000
```

## Development

### Backend

```bash
docker run -p 8000:8000 amazon/dynamodb-local
aws dynamodb list-tables --endpoint-url http://localhost:8000
sam local invoke "Login" -e ./dev-events/login-event.json
sam local invoke "GetNotes" -e ./dev-events/get-notes-event.json
```

Create users table
```bash
aws dynamodb create-table \
    --table-name mystash-dev-users \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=email,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        '[{
            "IndexName": "email-index",
            "KeySchema": [
                {
                    "AttributeName": "email",
                    "KeyType": "HASH"
                }
            ],
            "Projection": {
                "ProjectionType": "ALL"
            },
            "ProvisionedThroughput": {
                "ReadCapacityUnits": 1,
                "WriteCapacityUnits": 1
            }
        }]' \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:8000
```

Create notes table
```bash
aws dynamodb create-table \
    --table-name mystash-dev-notes \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=userId,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        '[{
            "IndexName": "user-id-index",
            "KeySchema": [
                {
                    "AttributeName": "userId",
                    "KeyType": "HASH"
                }
            ],
            "Projection": {
                "ProjectionType": "ALL"
            },
            "ProvisionedThroughput": {
                "ReadCapacityUnits": 1,
                "WriteCapacityUnits": 1
            }
        }]' \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:8000
```

List tables
```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

Delete table
```bash
aws dynamodb delete-table --table-name mystash-dev-users --endpoint-url http://localhost:8000
```

List items
```bash
aws dynamodb scan \
    --table-name mystash-dev-users \
    --endpoint-url http://localhost:8000
```

```bash
aws dynamodb delete-item \
    --table-name mystash-dev-users \
    --key '{"id": {"S": "replace-this-uuid-with-real"}}' \
    --endpoint-url http://localhost:8000
```

```bash
export SAM_BUILD_MODE=run
sam build --debug
sam local start-api
```

### Frontend

npm start

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
cdk synth --profile mystashapp-prod
cdk diff --profile mystashapp-prod
cdk deploy --profile mystashapp-prod
```
