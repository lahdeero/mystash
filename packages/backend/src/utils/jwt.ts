import type { AsyncApiHandler } from '../types/handler.js'
import type { User, UserToken } from '@mystash/shared'
import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
  Context,
} from 'aws-lambda'
import { createHmac, randomUUID, timingSafeEqual } from 'crypto'
import { isTokenRevoked } from './token-revocation.js'

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
  const encodedSignature = createHmac('sha256', secret)
    .update(signatureBase)
    .digest('base64url')

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
}

export const verifyJWT = (token: string, secret: string): string | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'))
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null
    const expected = createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest()
    const actual = Buffer.from(encodedSignature, 'base64url')
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
    if (typeof payload.id !== 'string' || !payload.id || !Number.isSafeInteger(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null
    return payload.id
  } catch {
    return null
  }
}

export const jwtMiddleware = (
  handler: AsyncApiHandler,
  secret: string
): AsyncApiHandler => {
  return async (
    event: APIGatewayProxyEvent,
    context: Context
  ) => {
    const authorization =
      event.headers.Authorization || event.headers.authorization

    // Check for the authorization header
    if (!authorization) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Authorization header missing' }),
      }
    }

    // Split the token from the header
    const [_bearer, token] = authorization.split(' ')
    if (!_bearer || _bearer.toLowerCase() !== 'bearer' || !token) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Invalid Authorization header format',
        }),
      }
    }

    // Verify the JWT
    let userId: string
    try {
      userId = verifyJWT(token, secret!)!
      // TODO: Locally requestContext is undefined, works in AWS (without this condition)
      if (!event.requestContext) {
        event.requestContext = {} as APIGatewayEventRequestContext
      }
      if (!userId || await isTokenRevoked(token)) {
        throw new Error('Invalid JWT')
      }
      event.requestContext.authorizer = { userId } // Store userId in event for later use
    } catch (error) {
      console.error('JWT verification failed', error)
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      }
    }
    const result = await handler(event, context)
    if (!result) {
      throw new Error('Handler did not return a result')
    }
    return result!
  }
}

export const createToken = (dbUser?: UserDbItem): UserToken => {
  if (!dbUser?.id) {
    throw new Error('User ID missing')
  }
  const { id, nickname, email, tier, hasAcceptedTerms } = dbUser
  const payload = {
    id,
    jti: randomUUID(),
    nickname,
    email,
    tier,
    hasAcceptedTerms,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Expire after 1 week
  }
  const token = createJWT(payload, process.env.SECRET!)
  const user: User = {
    nickname,
    tier,
    email,
    hasAcceptedTerms,
  }
  return { token, user }
}
