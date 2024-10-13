echo "Start DynamoDB Local in Docker..."
docker run -p 8001:8000 amazon/dynamodb-local

echo "Compile typescript..."
npx tsc

echo "Create the users table..."
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
    --endpoint-url http://localhost:8001

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
    --endpoint-url http://localhost:8001

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
    --endpoint-url http://localhost:8001

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
    --endpoint-url http://localhost:8001
