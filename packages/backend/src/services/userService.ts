import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv } from 'uuid'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { GitHubUser, UserTier, UserDbItem } from '../types/types.js'

export class UserService {
  private dynamoDb: DynamoDBDocumentClient

  constructor() {
    const client = new DynamoDBClient({
      endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    })
    this.dynamoDb = DynamoDBDocumentClient.from(client)
  }

  async createUser(data: GitHubUser): Promise<UserDbItem> {
    const id = uuidv()
    const nickname = data.name || data.login
    const command = new PutCommand({
      TableName: process.env.USERS_TABLE_NAME,
      Item: {
        id,
        email: data.email ?? `${data.login}@70511337.xyz`,
        nickname,
        githubLogin: data.login,
        githubId: data.id,
        githubAvatar: data.avatar_url,
        githubUrl: data.html_url,
        // GitHub login users must accept the terms before using the app
        hasAcceptedTerms: false,
      },
    })
    await this.dynamoDb.send(command)
    return {
      id,
      email: data.email ?? `${data.login}@70511337.xyz`,
      nickname,
      tier: UserTier.Free,
      hasAcceptedTerms: false,
    }
  }

  async searchGithubUser(
    githubId: number,
  ): Promise<UserDbItem | undefined> {
    const command = new QueryCommand({
      TableName: process.env.USERS_TABLE_NAME,
      IndexName: 'github-id-index',
      KeyConditionExpression: 'githubId = :githubId',
      ExpressionAttributeValues: {
        ':githubId': githubId,
      },
    })
    const data = await this.dynamoDb.send(command)
    console.info('data', { ...data, password: '<REDACTED>' })
    return data.Items?.[0] as UserDbItem | undefined
  }
}
