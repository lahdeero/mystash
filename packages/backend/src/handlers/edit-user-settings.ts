import type {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { User } from '@mystash/shared'

import { badRequest, jwtMiddleware } from '../utils/index.js'
import { emailPattern } from '../utils/validation.js'

// Whitelist of user settings that can be modified through this endpoint.
// Extend this map to allow editing additional user information in the future.
// The value is the expected JSON type for the corresponding field.
const EDITABLE_FIELDS: Record<string, 'string' | 'boolean'> = {
  hasAcceptedTerms: 'boolean',
  nickname: 'string',
  email: 'string',
}

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

const toUser = (item: Record<string, unknown>): User => ({
  nickname: item.nickname as string,
  email: item.email as string,
  tier: item.tier as string,
  hasAcceptedTerms: item.hasAcceptedTerms as boolean | undefined,
})

const checkEmailAvailable = async (
  email: string,
  userId: string,
): Promise<string | null> => {
  const command = new QueryCommand({
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  })
  const data = await dynamoDb.send(command)
  const taken = data.Items?.some((item: any) => item.id !== userId) ?? false
  return taken ? 'Email already exists' : null
}

const editUserSettingsHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer!.userId

  let body: Record<string, unknown>
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch (error) {
    return badRequest('Invalid JSON body')
  }

  const changes: Record<string, unknown> = {}
  const invalidFields: string[] = []
  for (const [key, value] of Object.entries(body)) {
    const expectedType = EDITABLE_FIELDS[key]
    if (!expectedType) {
      invalidFields.push(key)
      continue
    }
    if (typeof value !== expectedType) {
      invalidFields.push(key)
      continue
    }
    changes[key] = value
  }

  if (invalidFields.length > 0) {
    return badRequest(`Field(s) cannot be edited: ${invalidFields.join(', ')}`)
  }
  if (Object.keys(changes).length === 0) {
    return badRequest('No settings provided')
  }

  if ('email' in changes) {
    const email = changes.email as string
    if (!emailPattern.test(email)) {
      return badRequest('/email: must match format "email"')
    }
    const emailError = await checkEmailAvailable(email, userId)
    if (emailError) {
      return badRequest(emailError)
    }
  }

  const setClauses: string[] = []
  const expressionAttributeNames: Record<string, string> = {}
  const expressionAttributeValues: Record<string, unknown> = {}
  Object.entries(changes).forEach(([key, value], index) => {
    const nameToken = `#field${index}`
    const valueToken = `:value${index}`
    expressionAttributeNames[nameToken] = key
    expressionAttributeValues[valueToken] = value
    setClauses.push(`${nameToken} = ${valueToken}`)
  })

  const command = new UpdateCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Key: { id: userId },
    UpdateExpression: `SET ${setClauses.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  })
  const data = await dynamoDb.send(command)
  const item = data.Attributes as Record<string, unknown>

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(toUser(item), null, 2),
  }
}

export const handler = jwtMiddleware(editUserSettingsHandler, process.env.SECRET!)
