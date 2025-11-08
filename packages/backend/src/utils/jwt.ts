import type { User, UserToken } from '@mystash/shared'
import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  Callback,
  Context,
} from 'aws-lambda'
import { createHmac } from 'crypto'

import { UserDbItem } from '../types/types.js'

const base64UrlEncode = (input: string): string => {
  return Buffer.from(input)
    .toString('base64') // Muunna base64:ksi
    .replace(/\+/g, '-') // Muuta "+" merkki "-"
    .replace(/\//g, '_') // Muuta "/" merkki "_"
    .replace(/=+$/, '') // Poista padding
}

export const createJWT = (
  payload: Record<string, any>,
  secret: string
): string => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))

  const signatureBase = `${encodedHeader}.${encodedPayload}`
  const signature = createHmac('sha256', secret)
    .update(signatureBase)
    .digest('base64')
  const encodedSignature = base64UrlEncode(signature)

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
}

export const verifyJWT = (token: string, secret: string): string | null => {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
  const signatureBase = `${encodedHeader}.${encodedPayload}`

  const signature = createHmac('sha256', secret!)
    .update(signatureBase)
    .digest('base64')
  const validSignature = base64UrlEncode(signature)

  // Check if the provided signature matches the valid signature

  if (validSignature !== encodedSignature) {
    return null // Invalid token
  }

  // Decode payload
  const decodedPayload = JSON.parse(
    Buffer.from(encodedPayload, 'base64url').toString('utf8')
  )
  return decodedPayload.id
}

export const jwtMiddleware = (
  handler: APIGatewayProxyHandler,
  secret: string
): APIGatewayProxyHandler => {
  return async (
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback
  ) => {
    const authorization =
      event.headers.Authorization || event.headers.authorization

    // Check for the authorization header
    if (!authorization) {
      callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: 'Authorization header missing' }),
      })
      return
    }

    // Split the token from the header
    const [_bearer, token] = authorization.split(' ')
    if (!_bearer || _bearer.toLowerCase() !== 'bearer' || !token) {
      callback(null, {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Invalid Authorization header format',
        }),
      })
      return
    }

    // Verify the JWT
    let userId: string
    try {
      userId = verifyJWT(token, secret!)
      // TODO: Locally requestContext is undefined, works in AWS (without this condition)
      if (!event.requestContext) {
        event.requestContext = {} as APIGatewayEventRequestContext
      }
      if (!userId) {
        throw new Error('Invalid JWT')
      }
      event.requestContext.authorizer = { userId } // Store userId in event for later use
    } catch (error) {
      console.error('JWT verification failed', error)
      callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      })
      return
    }
    const result = await handler(event, context, callback)
    if (!result) {
      throw new Error('Handler did not return a result')
    }
    return result
  }
}

export const createToken = (dbUser?: UserDbItem): UserToken => {
  if (!dbUser.id) {
    throw new Error('User ID missing')
  }
  const { id, firstName, lastName, email, tier } = dbUser
  const payload = {
    id,
    firstName,
    lastName,
    email,
    tier,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Expire after 1 week
  }
  const token = createJWT(payload, process.env.SECRET!)
  const user: User = {
    firstName,
    lastName,
    tier,
    email,
  }
  return { token, user }
}
