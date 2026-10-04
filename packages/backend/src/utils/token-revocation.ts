import { createHash } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

const client = () => DynamoDBDocumentClient.from(new DynamoDBClient({ endpoint: process.env.DYNAMODB_ENDPOINT || undefined }))
const key = (token: string) => ({ id: `revoked-token:${createHash('sha256').update(token).digest('hex')}` })

export const isTokenRevoked = async (token: string): Promise<boolean> => {
  const result = await client().send(new GetCommand({ TableName: process.env.USERS_TABLE_NAME, Key: key(token), ConsistentRead: true }))
  return !!result.Item
}

export const revokeToken = async (token: string): Promise<void> => {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
  await client().send(new PutCommand({ TableName: process.env.USERS_TABLE_NAME, Item: { ...key(token), expiresAt: payload.exp } }))
}
