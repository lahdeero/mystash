import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

import { jwtMiddleware } from '../utils/jwt.js'

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

const updateNoteHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  const userId = event.requestContext.authorizer.userId
  const noteId = event.pathParameters.id

  const parsedBody = JSON.parse(event.body)
  const { title, content, tags } = parsedBody

  // check if note id belongs to user
  const queryCommand = new QueryCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    KeyConditionExpression: 'id = :id',
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':id': noteId,
      ':userId': userId,
    },
  })
  const data = await client.send(queryCommand)
  const note = data.Items?.[0]
  if (!note || note.userId !== userId) {
    return {
      statusCode: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ message: 'Note not found' }, null, 2),
    }
  }

  const updateExpression = `
      SET #title = :title,
      #content = :content,
      #tags = :tags,
      #updatedAt = :updatedAt
    `

  const command = new UpdateCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    Key: {
      id: noteId,
    },
    UpdateExpression: updateExpression.trim(),
    ExpressionAttributeNames: {
      '#title': 'title',
      '#content': 'content',
      '#tags': 'tags',
      '#updatedAt': 'updatedAt',
    },
    ExpressionAttributeValues: {
      ':title': title,
      ':content': content,
      ':tags': tags,
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  })
  const result = await dynamoDb.send(command)

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(result.Attributes, null, 2),
  }
}

export const handler = jwtMiddleware(updateNoteHandler, process.env.SECRET!)
