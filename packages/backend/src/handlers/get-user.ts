import type {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import type { User } from '@mystash/shared'

import { badRequest, jwtMiddleware } from '../utils/index.js'

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

const getCurrentUserHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer!.userId
  const command = new GetCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Key: { id: userId },
  })
  const data = await dynamoDb.send(command)
  const item = data.Item as Record<string, unknown> | undefined
  if (!item) {
    return badRequest('User not found')
  }

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(toUser(item), null, 2),
  }
}

export const handler = jwtMiddleware(getCurrentUserHandler, process.env.SECRET!)
