import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayEvent, Context, Callback, Handler } from 'aws-lambda'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { lookup } from 'mime-types'
import { jwtMiddleware } from '../utils/jwt'

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
  try {
    const parsedBody = JSON.parse(event.body)
    const { noteId, title, fileName, fileContent } = parsedBody
    if (!fileName || !fileContent) {
      throw new Error('Missing fileName or fileContent')
    }
    const mimeType = lookup(fileName)
    if (!mimeType) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ message: 'Unsupported file type' }),
      }
    }
    console.log('File upload', { fileName })

    const id = uuidv4()
    const fileUploadCommand = new PutObjectCommand({
      Bucket: process.env.FILE_BUCKET,
      Key: id,
      Body: Buffer.from(fileContent, 'base64'), // Assuming fileContent is base64 encoded
    })
    const { ETag: eTag } = await s3Client.send(fileUploadCommand)

    const item = {
      id,
      fileName,
      mimeType,
      eTag,
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

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(
        {
          fileId: id,
        },
        null,
        2
      ),
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(
        { message: 'Error while uploading file', error: error?.message ?? '' },
        null,
        2
      ),
    }
  }
}

export const handler = jwtMiddleware(uploadFileHandler, process.env.SECRET!)
