import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import axios from 'axios'

import { GitHubUser } from '../types/types.js'
import { noAccess, createToken } from '../utils/index.js'
import { UserService } from '../services/userService.js'

export const verifyGithubHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const parsedBody = JSON.parse(event.body)
  if (!parsedBody?.code) {
    return noAccess('Code is required')
  }
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: parsedBody.code,
  }
  const { data: tokenData } = await axios.post<string>(
    'https://github.com/login/oauth/access_token',
    params,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  )
  const accessToken = new URLSearchParams(tokenData).get('access_token')
  if (!accessToken) {
    return noAccess('Invalid access token')
  }
  const { data } = await axios.get<GitHubUser>('https://api.github.com/user', {
    headers: {
      Accept: 'application',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const userService = new UserService()
  const dbUser = await userService.searchGithubUser(data.id)
  const item = dbUser ?? (await userService.createUser(data))
  const { token, user } = createToken(item)

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ token, user }, null, 2),
  }
}

export const handler = verifyGithubHandler
