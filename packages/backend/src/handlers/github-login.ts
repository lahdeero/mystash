import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'

const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize'

const githubLoginHandler: APIGatewayProxyHandler = async (
  _event: APIGatewayProxyEvent
) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: 'read:user user:email',
    state: Math.random().toString(36).substring(2),
  })
  const redirectUrl = `${GITHUB_OAUTH_URL}?${params.toString()}`
  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
    },
    body: '',
  }
}

export const handler = githubLoginHandler
