import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  APIGatewayEvent,
  Context,
  Callback,
  Handler,
  APIGatewayProxyResult,
} from 'aws-lambda'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { jwtMiddleware } from '../utils/jwt'
import { FileType, GetNoteFilesResponse } from '../types/types'

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

const getNoteFiles: Handler<APIGatewayEvent, any> = async (
  event: APIGatewayEvent,
  _context: Context,
  _callback: Callback
): Promise<APIGatewayProxyResult> => {
  const noteId = event.pathParameters.id
  if (!noteId) {
    throw new Error('Missing noteId')
  }

  const userId = event.requestContext.authorizer.userId
  const command = new QueryCommand({
    TableName: process.env.FILES_TABLE_NAME,
    IndexName: 'note-id-index',
    KeyConditionExpression: 'noteId = :noteId',
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':noteId': noteId,
    },
  })
  const data = await dynamoDb.send(command)

  const response: GetNoteFilesResponse = {
    noteId,
    files: data.Items as FileType[],
  }
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(response, null, 2),
  }
}

export const handler = jwtMiddleware(getNoteFiles, process.env.SECRET!)
