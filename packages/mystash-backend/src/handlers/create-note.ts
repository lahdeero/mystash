import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { DynamoDB, DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb"
import { v4 as uuidv4 } from 'uuid'
import { jwtMiddleware } from "../utils/jwt"

const createNoteHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer.userId
  const client: DynamoDBClient = DynamoDBDocumentClient.from(new DynamoDB({
    region: process.env.REGION,
  }))
  if (!event.body) {
    throw new Error('Event has no body!')
  }

  const parsedBody = JSON.parse(event.body)
  const { title, content, tags } = parsedBody

  const item = {
    id: uuidv4(),
    title,
    content,
    tags,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    userId
  }
  const command = new PutCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    Item: item,
  })
  await client.send(command)
  return {
    statusCode: 201,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(item, null, 2),
  }
}

export const handler = jwtMiddleware(createNoteHandler, process.env.SECRET)