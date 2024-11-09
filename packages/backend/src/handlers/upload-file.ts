import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayEvent, Context, Callback, Handler } from 'aws-lambda'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { FileInfo } from '../types/types'
import { exntensionToMimeType, jwtMiddleware } from '../utils/index.js'

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)
const s3Client = new S3Client({
  region: process.env.REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // Required for LocalStack
})

const uploadFileHandler: Handler<APIGatewayEvent, any> = async (
  event: APIGatewayEvent,
  _context: Context,
  _callback: Callback
) => {
  const userId = event.requestContext.authorizer.userId
  const parsedBody = JSON.parse(event.body)
  const { title, fileName, noteId } = parsedBody
  const mimeType = exntensionToMimeType[fileName.split('.').pop()!]
  if (!noteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing noteId' }),
    }
  }
  if (!mimeType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid file extension' }),
    }
  }

  const id = uuidv4()

  try {
    const item: FileInfo = {
      id,
      fileName,
      mimeType,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      noteId,
      userId: event.requestContext.authorizer.userId,
    }
    const saveFileInfoCommand = new PutCommand({
      TableName: process.env.FILES_TABLE_NAME,
      Item: item,
    })
    await dynamoDb.send(saveFileInfoCommand)

    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.FILE_BUCKET,
        Key: `${userId}/${fileName}`,
      }),
      { expiresIn: 60 }
    )

    const body = {
      uploadUrl,
    }
    return {
      statusCode: 200,
      body: JSON.stringify(body),
    }
  } catch (error) {
    console.error('Error uploading file', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error uploading file' }),
    }
  }
}

export const handler = jwtMiddleware(uploadFileHandler, process.env.SECRET!)
