#!/bin/bash

set -Eeuo pipefail
trap 'echo "Backend setup failed at line $LINENO" >&2' ERR

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
ENV_FILE="$SCRIPT_DIR/.env"
echo "Setting up development environment for mystash backend..."
export AWS_REGION=eu-north-1 # Could remove --region flag from AWS CLI commands, but keeping them for now..
export AWS_PAGER=""

echo "Remove existing Docker containers..."
docker info >/dev/null
for container in dynamodb-local s3-local; do
    if docker container inspect "$container" >/dev/null 2>&1; then
        docker rm -f "$container"
    fi
done
echo "Removed existing Docker containers."

echo "Start DynamoDB Local in Docker..."
docker run -d --name dynamodb-local -p 8001:8000 amazon/dynamodb-local
echo "DynamoDB Local started in Docker."

echo "Start LocalStack in Docker..."
docker run -d --name s3-local -p 4566:4566 -e SERVICES=s3 localstack/localstack:3.8
echo "LocalStack started in Docker."

echo "Build shared package..."
cd ../shared && pnpm run build && cd ../backend
echo "Shared package built."

echo "Transpile typescript..."
tsc --build
echo "Typescript transpiled."

wait_for_service() {
    local name="$1"
    shift
    local deadline=$((SECONDS + 60))
    echo "Waiting for $name..."
    until "$@" >/dev/null 2>&1; do
        if (( SECONDS >= deadline )); then
            echo "Timed out waiting for $name" >&2
            return 1
        fi
        sleep 1
    done
}

wait_for_service "DynamoDB" aws --cli-connect-timeout 2 --cli-read-timeout 2 --endpoint-url=http://localhost:8001 --region eu-north-1 dynamodb list-tables
wait_for_service "S3" aws --cli-connect-timeout 2 --cli-read-timeout 2 --endpoint-url=http://localhost:4566 --region eu-north-1 s3api list-buckets

echo "Create s3 bucket..."
aws --endpoint-url=http://localhost:4566 --region eu-north-1 s3 mb s3://mystash-dev-infra-files-bucket --region eu-north-1
echo "S3 bucket created."

echo "Set S3 CORS policy..."
aws --endpoint-url=http://localhost:4566 --region eu-north-1 s3api put-bucket-cors --bucket mystash-dev-infra-files-bucket --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT"],
      "AllowedHeaders": ["*"]
    }
  ]
}'
echo "S3 CORS policy set."

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
    --region eu-north-1 \
    --endpoint-url http://localhost:8001
echo "Users table created."    

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
    --region eu-north-1 \
    --endpoint-url http://localhost:8001
echo "Notes table created."

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
    --region eu-north-1 \
    --endpoint-url http://localhost:8001
echo "Files table created."

echo "Waiting for mystash-dev-users table to be active..."
aws dynamodb wait table-exists --table-name mystash-dev-users --endpoint-url http://localhost:8001 --region eu-north-1
echo "Waiting for mystash-dev-notes table to be active..."
aws dynamodb wait table-exists --table-name mystash-dev-notes --endpoint-url http://localhost:8001 --region eu-north-1
echo "Waiting for mystash-dev-files table to be active..."
aws dynamodb wait table-exists --table-name mystash-dev-files --endpoint-url http://localhost:8001 --region eu-north-1
echo "All tables are active."


echo "Seed the users table..."
aws dynamodb put-item \
    --table-name mystash-dev-users \
    --item '{
        "id": {"S": "b4f437f8-690d-4620-9166-a47887450913"},
        "nickname": {"S": "JohnDoe"},
        "email": {"S": "test@example.com"},
        "password": {"S": "2dc6e6c891c0e3acfa5b312c0da3e26e"},
        "hasAcceptedTerms": {"BOOL": true}
    }' \
    --region eu-north-1 \
    --endpoint-url http://localhost:8001
aws dynamodb put-item \
    --table-name mystash-dev-users \
    --item '{
        "id": {"S": "add80a47-7ba6-4b28-8bff-5fdb461f5a5f"},
        "nickname": {"S": "DevUser"},
        "email": {"S": "dev@example.com"},
        "password": {"S": "2dc6e6c891c0e3acfa5b312c0da3e26e"},
        "hasAcceptedTerms": {"BOOL": true}
    }' \
    --region eu-north-1 \
    --endpoint-url http://localhost:8001
echo "Users table seeded."

echo "Seed the notes table..."
for batch in "$SCRIPT_DIR"/seed/notes-seed-batch-*.json; do
    aws dynamodb batch-write-item \
        --request-items "file://$batch" \
        --region eu-north-1 \
        --endpoint-url http://localhost:8001
done
echo "42 notes seeded."

if [ -f .env ]; then
    echo "Setup environment variables..."
    . "$ENV_FILE"
    export ENVIRONMENT
    export MYSTASH_SECRET
    export GITHUB_CLIENT_ID
    export GITHUB_CLIENT_SECRET
    export GITHUB_REDIRECT_URI
    export DYNAMODB_ENDPOINT="http://localhost:8001"
    echo "Environment variables set"
else
     echo "No .env file found, assuming environment variables are already set."
fi
