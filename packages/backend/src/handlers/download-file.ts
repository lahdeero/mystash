import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayEvent, Context, Callback, Handler } from 'aws-lambda'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { jwtMiddleware } from '../utils/jwt'
import * as stream from 'stream'

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

const s3Client = new S3Client({
  region: process.env.REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // Required for LocalStack
})

const downloadFileHandler: Handler<APIGatewayEvent, any> = async (
  event: APIGatewayEvent,
  _context: Context,
  _callback: Callback
) => {
  try {
    const fileId = event.queryStringParameters?.id
    if (!fileId) {
      throw new Error('Missing fileId')
    }

    // Fetch file metadata from DynamoDB
    const getFileCommand = new GetCommand({
      TableName: process.env.FILES_TABLE_NAME,
      Key: { id: fileId },
    })
    const fileMetadata = await dynamoDb.send(getFileCommand)
    const item = fileMetadata.Item
    if (!item) {
      return {
        statusCode: 404,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ message: 'File not found' }),
      }
    }
    if (!item.fileName) {
      throw new Error('Invalid file metadata: missing fileName')
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.FILE_BUCKET,
      Key: fileId,
    })
    const s3Response: GetObjectCommandOutput =
      await s3Client.send(getObjectCommand)

    const fileStream = s3Response.Body as stream.Readable
    const chunks: Buffer[] = []

    for await (const chunk of fileStream) {
      chunks.push(chunk)
    }

    const fileContent = Buffer.concat(chunks).toString('base64')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${item.fileName}"`,
      },
      body: fileContent,
      isBase64Encoded: true,
    }
  } catch (error) {
    console.error('Error downloading file:', error)
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(
        {
          message: 'Error while downloading file',
          error: error?.message ?? '',
        },
        null,
        2
      ),
    }
  }
}

export const handler = jwtMiddleware(downloadFileHandler, process.env.SECRET!)
