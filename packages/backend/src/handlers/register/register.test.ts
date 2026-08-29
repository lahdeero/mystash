import { vi, describe, test, expect, beforeEach } from 'vitest'
import { APIGatewayProxyResult } from 'aws-lambda'
import type { User } from '@mystash/shared'

import { getEvent, getContext } from '../../utils/test-utils.js'
import { handler } from './register.js'

const testUserId = 'f1626fa2-8fe9-48f3-aca3-7d64d65f84f7'
const validBody = {
  email: 'test@example.com',
  nickname: 'TestUser',
  password: 'password123',
}

const expectedUser: User = {
  email: validBody.email,
  nickname: validBody.nickname,
  tier: 'free',
  hasAcceptedTerms: true,
}

const { mockClientSend, mockDynamoDbSend } = vi.hoisted(() => {
  const mockClientSend = vi.fn()
  const mockDynamoDbSend = vi.fn()
  return { mockClientSend, mockDynamoDbSend }
})

vi.mock('uuid', () => ({
  v4: vi.fn(() => testUserId),
}))

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn(() => ({
    send: mockClientSend,
  })),
}))

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: vi.fn(() => ({
      send: mockDynamoDbSend,
    })),
  },
  PutCommand: vi.fn(),
  QueryCommand: vi.fn(),
}))

describe('register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockClientSend.mockResolvedValue({ Items: [] })
    mockDynamoDbSend.mockResolvedValue({})
  })

  describe('registerHandler', () => {
    test('should register a new user successfully', async () => {
      const result = (await handler(
        getEvent(JSON.stringify(validBody), 'POST'),
        getContext(),
        vi.fn()
      )) as APIGatewayProxyResult

      expect(result.statusCode).toBe(201)
      expect(result.headers).toEqual({
        'content-type': 'application/json; charset=utf-8',
      })
      const parsed = JSON.parse(result.body)
      expect(parsed).toEqual(expectedUser)
      expect(parsed).not.toHaveProperty('password')
    })

    test('should return 400 when body is missing', async () => {
      await expect(
        handler(getEvent(null, 'POST'), getContext(), vi.fn())
      ).rejects.toEqual({
        statusCode: 400,
        headers: expect.any(Object),
        body: JSON.stringify({
          error: { message: 'Request body is required' },
        }),
      })
    })

    test('should return 400 when body is invalid JSON', async () => {
      await expect(
        handler(getEvent('not-json', 'POST'), getContext(), vi.fn())
      ).rejects.toEqual({
        statusCode: 400,
        headers: expect.any(Object),
        body: JSON.stringify({
          error: { message: 'Invalid JSON body' },
        }),
      })
    })

    test('should return 400 when nickname is too short', async () => {
      const body = { ...validBody, nickname: 'ab' }
      await expect(
        handler(
          getEvent(JSON.stringify(body), 'POST'),
          getContext(),
          vi.fn()
        )
      ).rejects.toEqual({
        statusCode: 400,
        headers: expect.any(Object),
        body: JSON.stringify({
          error: {
            message: '/nickname: must NOT have fewer than 3 characters',
          },
        }),
      })
    })

    test('should return 400 when password is too short', async () => {
      const body = { ...validBody, password: 'short' }
      await expect(
        handler(
          getEvent(JSON.stringify(body), 'POST'),
          getContext(),
          vi.fn()
        )
      ).rejects.toEqual({
        statusCode: 400,
        headers: expect.any(Object),
        body: JSON.stringify({
          error: {
            message: '/password: must NOT have fewer than 8 characters',
          },
        }),
      })
    })

    test('should return 400 when email is invalid', async () => {
      const body = { ...validBody, email: 'not-an-email' }
      await expect(
        handler(
          getEvent(JSON.stringify(body), 'POST'),
          getContext(),
          vi.fn()
        )
      ).rejects.toEqual({
        statusCode: 400,
        headers: expect.any(Object),
        body: JSON.stringify({
          error: {
            message: '/email: must match format "email"',
          },
        }),
      })
    })

    test('should return 400 when required fields are missing', async () => {
      const body = { email: 'test@example.com' }
      await expect(
        handler(
          getEvent(JSON.stringify(body), 'POST'),
          getContext(),
          vi.fn()
        )
      ).rejects.toEqual({
        statusCode: 400,
        headers: expect.any(Object),
        body: JSON.stringify({
          error: {
            message:
              "body: must have required property 'nickname', body: must have required property 'password'",
          },
        }),
      })
    })

    test('should return 400 when unknown properties are provided', async () => {
      const body = { ...validBody, extraField: 'hacker' }
      await expect(
        handler(
          getEvent(JSON.stringify(body), 'POST'),
          getContext(),
          vi.fn()
        )
      ).rejects.toEqual({
        statusCode: 400,
        headers: expect.any(Object),
        body: JSON.stringify({
          error: {
            message: 'body: must NOT have additional properties',
          },
        }),
      })
    })

    test('should return 401 when email already exists', async () => {
      mockClientSend.mockResolvedValue({ Items: [{ email: validBody.email }] })

      const result = (await handler(
        getEvent(JSON.stringify(validBody), 'POST'),
        getContext(),
        vi.fn()
      )) as APIGatewayProxyResult

      expect(result.statusCode).toBe(401)
      expect(JSON.parse(result.body)).toEqual({
        error: { message: 'Email already exists' },
      })
    })

    test('should return 400 when email exceeds max length', async () => {
      const longEmail = 'a'.repeat(249) + '@b.com'
      const body = { ...validBody, email: longEmail }
      await expect(
        handler(
          getEvent(JSON.stringify(body), 'POST'),
          getContext(),
          vi.fn()
        )
      ).rejects.toEqual({
        statusCode: 400,
        headers: expect.any(Object),
        body: JSON.stringify({
          error: {
            message: '/email: must NOT have more than 254 characters',
          },
        }),
      })
    })

    test('should return 400 when password exceeds max length', async () => {
      const body = { ...validBody, password: 'a'.repeat(255) }
      await expect(
        handler(
          getEvent(JSON.stringify(body), 'POST'),
          getContext(),
          vi.fn()
        )
      ).rejects.toEqual({
        statusCode: 400,
        headers: expect.any(Object),
        body: JSON.stringify({
          error: {
            message: '/password: must NOT have more than 254 characters',
          },
        }),
      })
    })
  })
})
