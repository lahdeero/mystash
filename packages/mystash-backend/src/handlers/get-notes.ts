import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { DynamoDB, DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { jwtMiddleware } from "../utils/jwt"

const getNotesHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer.userId
  const client: DynamoDBClient = DynamoDBDocumentClient.from(new DynamoDB({
    region: process.env.REGION,
  }))
  const command = new QueryCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    IndexName: "user-id-index",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  })
  const data = await client.send(command)
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(data.Items, null, 2),
  }
}

export const handler = jwtMiddleware(getNotesHandler, process.env.SECRET)
