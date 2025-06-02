import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

import { createToken, noAccess, decryptData } from '../utils/index.js'
import { UserDbItem } from '../types/types.js'

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
  console.info(
    'Login attempt with password',
    { email: parsedBody.email },
    process.env.DYNAMODB_ENDPOINT
  )
  const command = new QueryCommand({
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': parsedBody.email,
    },
  })
  const data = await dynamoDb.send(command)
  console.info('data', { ...data, password: '<REDACTED>' })
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
