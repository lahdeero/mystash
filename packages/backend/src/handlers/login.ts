import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

import { createJWT, createToken } from '../utils/jwt'
import { noAccess } from '../utils/http'
import { decryptData } from '../utils/cryptography'
import { UserDbItem } from '../types/types'

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

export const loginHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const parsedBody = JSON.parse(event.body)
  if (!(parsedBody?.email && parsedBody?.password)) {
    return noAccess('Email and password are required')
  }
  console.log('Login attempt with password', { email: parsedBody.email })
  const command = new QueryCommand({
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': parsedBody.email,
    },
  })
  const data = await dynamoDb.send(command)
  console.log('data', { ...data, password: '<REDACTED>' })
  const item = data.Items?.[0] as UserDbItem | undefined
  const dbPassword = item?.password
  const invalidUserNameOrPassword = 'Invalid username or password'
  if (!dbPassword) {
    return noAccess(invalidUserNameOrPassword)
  }
  let passwordCorrect: boolean
  try {
    passwordCorrect = decryptData(dbPassword) === parsedBody.password
  } catch (e) {
    console.error('Error decrypting password', e)
    passwordCorrect = false
  }
  if (!passwordCorrect) {
    return noAccess(invalidUserNameOrPassword)
  }
  const { token, user } = createToken(item)

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ token, user }, null, 2),
  }
}

export const handler = loginHandler
