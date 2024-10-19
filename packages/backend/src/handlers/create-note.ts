import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { jwtMiddleware } from '../utils/jwt'

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

const createNoteHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  const userId = event.requestContext.authorizer.userId
  if (!event.body) {
    throw new Error('Event has no body!')
  }

  const parsedBody = JSON.parse(event.body)
  const { title, content, tags, createdAt, updatedAt } = parsedBody

  const item = {
    id: uuidv4(),
    title,
    content,
    tags,
    createdAt: createdAt ?? new Date().toISOString(),
    updatedAt: updatedAt ?? new Date().toISOString(),
    userId,
  }
  const command = new PutCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    Item: item,
  })
  await dynamoDb.send(command)
  return {
    statusCode: 201,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(item, null, 2),
  }
}

export const handler = jwtMiddleware(createNoteHandler, process.env.SECRET!)
