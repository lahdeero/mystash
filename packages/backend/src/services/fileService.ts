import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { CurrentUser, FileInfo, GetNoteFilesResponse } from "../types/types"

export class FileService {
  private dynamoDb: DynamoDBDocumentClient
  private s3Client: S3Client

  constructor() {
    const client = new DynamoDBClient({
      endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    })
    this.dynamoDb = DynamoDBDocumentClient.from(client)
    this.s3Client = new S3Client({
      region: process.env.REGION,
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true, // Required for LocalStack
    })
  }

  async getFilesByNoteId(
    noteId: string,
    currentUser: CurrentUser,
  ): Promise<GetNoteFilesResponse> {
    const command = new QueryCommand({
      TableName: process.env.FILES_TABLE_NAME,
      IndexName: 'note-id-index',
      KeyConditionExpression: 'noteId = :noteId',
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': currentUser.userId,
        ':noteId': noteId,
      },
    })
    const data = await this.dynamoDb.send(command)
    const files: FileInfo[] = await Promise.all(
      data.Items.map(async (item) => {
        const file = item as FileInfo
        return {
          ...file,
          url: await this.getFileUrl(currentUser, file.fileName),
        }
      })
    )
    return {
      noteId,
      files,
    }
  }

  async getUploadUrl(currentUser: CurrentUser, fileInfo: FileInfo): Promise<string> {
    const { userId } = currentUser
    const { fileName } = fileInfo
    const uploadUrl = await getSignedUrl(
      this.s3Client,
      new PutObjectCommand({
        Bucket: process.env.FILES_BUCKET_NAME,
        Key: `${userId}/${fileName}`,
      }),
      { expiresIn: 60 }
    )
    return uploadUrl
  }

  private async getFileUrl (currentUser: CurrentUser, fileName: string) : Promise<string> {
    const { userId } = currentUser
    const url = await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: process.env.FILES_BUCKET_NAME,
        Key: `${userId}/${fileName}`,
      }),
      { expiresIn: 3600 }
    )
    return url
  }
}
