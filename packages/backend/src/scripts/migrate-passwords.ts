import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { decryptLegacyPassword, hashPassword, isPasswordHash } from '../utils/cryptography.js'

if (!process.env.USERS_TABLE_NAME || !process.env.LEGACY_PASSWORD_SECRET) throw new Error('USERS_TABLE_NAME and LEGACY_PASSWORD_SECRET are required')
const db = DynamoDBDocumentClient.from(new DynamoDBClient({ endpoint: process.env.DYNAMODB_ENDPOINT || undefined }))
let cursor: Record<string, any> | undefined
let migrated = 0

do {
  const result = await db.send(new ScanCommand({ TableName: process.env.USERS_TABLE_NAME, ExclusiveStartKey: cursor, ProjectionExpression: 'id, password' }))
  for (const item of result.Items ?? []) {
    if (typeof item.password !== 'string' || isPasswordHash(item.password)) continue
    const hash = await hashPassword(decryptLegacyPassword(item.password))
    try {
      await db.send(new UpdateCommand({
        TableName: process.env.USERS_TABLE_NAME,
        Key: { id: item.id },
        UpdateExpression: 'SET password = :hash',
        ConditionExpression: 'password = :previous',
        ExpressionAttributeValues: { ':hash': hash, ':previous': item.password },
      }))
      migrated++
    } catch (error) {
      if (!(error instanceof Error) || error.name !== 'ConditionalCheckFailedException') throw error
    }
  }
  cursor = result.LastEvaluatedKey
} while (cursor)
console.info('Passwords migrated:', migrated)
