import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv } from 'uuid'

import { UserTier } from '../types/types.js'
import {
  noAccess,
  encryptData,
} from '../utils/index.js'
import { parseJsonBody } from '../utils/utils.js'
import { registerRequestSchema } from '../schemas/registerSchema.js'
import { User } from '@mystash/shared'

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

const checkEmailErrors = async (email: string): Promise<string | null> => {
  const command = new QueryCommand({
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  })
  const result = await client.send(command)
  return result.Items && result.Items.length > 0 ? 'Email already exists' : null
}

export const registerHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { email, firstName, lastName, password } = parseJsonBody(event, registerRequestSchema)

  const emailErrors = await checkEmailErrors(email)
  if (emailErrors) {
    return noAccess(emailErrors)
  }

  const encryptedPassword = encryptData(password)
  const tier = UserTier.Free
  const user: User = {
    email,
    firstName,
    lastName,
    tier,
  }
  const command = new PutCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Item: {
      id: uuidv(),
      password: encryptedPassword,
      ...user,
    },
  })
  await dynamoDb.send(command)
  return {
    statusCode: 201,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(user),
  }
}

export const handler = registerHandler
