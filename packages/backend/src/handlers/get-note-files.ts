import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  APIGatewayEvent,
  Context,
  Callback,
  Handler,
  APIGatewayProxyResult,
} from 'aws-lambda'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { jwtMiddleware } from '../utils/index.js'
import { FileInfo, GetNoteFilesResponse } from '../types/types.js'

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)
const s3 = new S3Client({
  region: process.env.REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // Required for LocalStack
})

const getFileUrl = async (userId: string, fileName: string) => {
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.FILES_BUCKET_NAME,
      Key: `${userId}/${fileName}`,
    }),
    { expiresIn: 3600 }
  )
  return url
}

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
  const files: FileInfo[] = await Promise.all(
    data.Items.map(async (item) => {
      const file = item as FileInfo
      return {
        ...file,
        url: await getFileUrl(userId, file.fileName),
      }
    })
  )

  const response: GetNoteFilesResponse = {
    noteId,
    files,
  }
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(response, null, 2),
  }
}

export const handler = jwtMiddleware(getNoteFiles, process.env.SECRET!)
