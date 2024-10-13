import type { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { jwtMiddleware } from "../utils/jwt"
import { GetNotesResponse } from "../types/types"

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer.userId
  const command = new QueryCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    IndexName: "user-id-index",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  })
  const data = await dynamoDb.send(command)
  const response = data.Items as GetNotesResponse
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(response, null, 2),
  }
}

export const getNotesHandler = jwtMiddleware(handler, process.env.SECRET!)
