import type { AsyncApiHandler } from '../types/handler.js'
import type { APIGatewayProxyEvent } from 'aws-lambda'

import { createOAuthState, isOAuthNonce } from '../utils/oauth-state.js'
import { badRequest } from '../utils/http.js'

const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize'

const githubLoginHandler: AsyncApiHandler = async (
  event: APIGatewayProxyEvent
) => {
  const nonce = event.queryStringParameters?.nonce
  if (!isOAuthNonce(nonce)) return badRequest('Invalid OAuth login attempt')
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_REDIRECT_URI!,
    scope: 'read:user user:email',
    state: createOAuthState(nonce, process.env.SECRET!),
  })
  const redirectUrl = `${GITHUB_OAUTH_URL}?${params.toString()}`
  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
    body: '',
  }
}

export const handler = githubLoginHandler
