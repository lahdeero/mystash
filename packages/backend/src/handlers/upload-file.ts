import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayEvent, Context, Callback, Handler } from 'aws-lambda'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { lookup } from 'mime-types'
import Busboy from 'busboy'
import { jwtMiddleware } from '../utils/jwt'
import { FileType } from '../types/types'

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
    if (!event.headers['Content-Type'].startsWith('multipart/form-data')) {
      throw new Error('Unsupported content type')
    }

    // const busboy = new Busboy({ headers: event.headers })
    const headers = {
      ...event.headers,
      'content-type':
        event.headers['Content-Type'] ?? event.headers['content-Type'],
    }
    const busboy = Busboy({ headers })
    let fileContent: Buffer | undefined
    let fileName: string | undefined
    let noteId: string | undefined
    let title: string | undefined

    await new Promise((resolve, reject) => {
      busboy.on('file', (fieldname, file, info) => {
        if (fieldname === 'fileData') {
          fileName = info.filename
          const buffers: any[] = []
          file.on('data', (data) => buffers.push(data))
          file.on('end', () => {
            fileContent = Buffer.concat(buffers)
          })
        }
      })

      busboy.on('field', (fieldname, value) => {
        if (fieldname === 'noteId') {
          noteId = value
        } else if (fieldname === 'title') {
          title = value
        }
      })

      busboy.on('finish', resolve)
      busboy.on('error', reject)

      busboy.write(
        event.body as string,
        event.isBase64Encoded ? 'base64' : 'utf8'
      )
      busboy.end()
    })

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
      Body: fileContent,
    })
    const { ETag: eTag } = await s3Client.send(fileUploadCommand)

    const item: FileType = {
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
