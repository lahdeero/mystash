#!/bin/bash

# TODO: Logging to local-init.log doesnt work

echo "Remove existing Docker containers..."
docker rm -f dynamodb-local s3-local 2>/dev/null

echo "Start DynamoDB Local in Docker..."
docker run -d --name dynamodb-local -p 8001:8000 amazon/dynamodb-local

echo "Start LocalStack in Docker..."
docker run -d --name s3-local -p 4566:4566 -e SERVICES=s3 localstack/localstack

echo "Build shared package..."
cd ../shared && npm run build && cd ../backend

echo "Transpile typescript..."
npx tsc

echo "Create s3 bucket..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://mystash-dev-infra-files-bucket

echo "Set S3 CORS policy..."
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors --bucket mystash-dev-infra-files-bucket --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT"],
      "AllowedHeaders": ["*"]
    }
  ]
}'

echo "Create the users table..."
aws dynamodb create-table \
    --table-name mystash-dev-users \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=email,AttributeType=S \
        AttributeName=githubId,AttributeType=N \
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
        },
        {
            "IndexName": "github-id-index",
            "KeySchema": [
                {
                    "AttributeName": "githubId",
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
    --endpoint-url http://localhost:8001 > local-init.log 2>&1

echo "Create the notes table..."
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
    --endpoint-url http://localhost:8001 > local-init.log 2>&1

echo "Create the files table..."
aws dynamodb create-table \
    --table-name mystash-dev-files \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=noteId,AttributeType=S \
        AttributeName=userId,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        '[{
            "IndexName": "note-id-index",
            "KeySchema": [
                {
                    "AttributeName": "noteId",
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
        },
        {
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
    --endpoint-url http://localhost:8001 > local-init.log 2>&1

echo "Seed the users table..."
aws dynamodb put-item \
    --table-name mystash-dev-users \
    --item '{
        "id": {"S": "b4f437f8-690d-4620-9166-a47887450913"},
        "firstName": {"S": "John"},
        "lastName": {"S": "Doe"},
        "email": {"S": "test@example.com"},
        "password": {"S": "2dc6e6c891c0e3acfa5b312c0da3e26e"}
    }' \
    --endpoint-url http://localhost:8001 > local-init.log 2>&1

echo "Seed the notes table..."
aws dynamodb put-item \
    --table-name mystash-dev-notes \
    --item '{
        "id": {"S": "42f0ee81-9a6a-4fcf-8754-7071ad5921b6"},
        "userId": {"S": "b4f437f8-690d-4620-9166-a47887450913"},
        "title": {"S": "test title"},
        "content": {"S": "test content"},
        "tags": {"L": [
            {"S": "firstTag"},
            {"S": "secondTag"}
        ]},
        "createdAt": {"S": "2024-10-13T17:30:31.222Z"},
        "updatedAt": {"S": "2024-10-13T17:30:31.222Z"}
    }' \
    --endpoint-url http://localhost:8001 > local-init.log 2>&1

echo Setup environment variables...
source .env
export MYSTASH_SECRET
export GITHUB_CLIENT_ID
export GITHUB_CLIENT_SECRET
export GITHUB_REDIRECT_URI
