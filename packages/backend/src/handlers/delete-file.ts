import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'

import { jwtMiddleware } from '../utils/index.js'

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

const deleteFileHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  const userId = event.requestContext.authorizer.userId
  if (!event.pathParameters) {
    throw new Error('Event has no body!')
  }

  const fileId = event.pathParameters.id
  // check that file id belongs to user
  const queryCommand = new QueryCommand({
    TableName: process.env.FILES_TABLE_NAME,
    KeyConditionExpression: 'id = :id',
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':id': fileId,
      ':userId': userId,
    },
  })
  const data = await client.send(queryCommand)
  const file = data.Items?.[0]
  if (!file || file.userId !== userId) {
    return {
      statusCode: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ message: 'File not found' }, null, 2),
    }
  }

  const command = new DeleteCommand({
    TableName: process.env.FILES_TABLE_NAME,
    Key: {
      id: fileId.toString(),
    },
    ReturnValues: 'ALL_OLD',
  })
  const result = await dynamoDb.send(command)
  console.log('result', result)
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(result.Attributes, null, 2),
  }
}

export const handler = jwtMiddleware(deleteFileHandler, process.env.SECRET!)
