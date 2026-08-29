import { vi, describe, test, expect, beforeEach } from 'vitest'
import { APIGatewayProxyResult } from 'aws-lambda'
import type { User } from '@mystash/shared'

import { getEvent, getContext } from '../utils/test-utils.js'
import { handler } from './get-user.js'

const dbItem = {
  id: '9e53ca88-44f3-4210-a5f7-90d4717a3d6a',
  nickname: 'TestUser',
  email: 'test@example.com',
  tier: 'free',
  hasAcceptedTerms: true,
  password: 'encrypted-secret', // should never leak to the response
}

const expectedUser: User = {
  nickname: dbItem.nickname,
  email: dbItem.email,
  tier: dbItem.tier,
  hasAcceptedTerms: dbItem.hasAcceptedTerms,
}

const { mockDynamoDbSend } = vi.hoisted(() => {
  const mockDynamoDbSend = vi.fn()
  return { mockDynamoDbSend }
})

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn(() => ({})),
}))

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: vi.fn(() => ({
      send: mockDynamoDbSend,
    })),
  },
  GetCommand: vi.fn((input: any) => ({ input })),
}))

describe('get-user', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockDynamoDbSend.mockResolvedValue({ Item: dbItem })
  })

  test('should return the current user without the password', async () => {
    const result = (await handler(
      getEvent(),
      getContext(),
      vi.fn()
    )) as APIGatewayProxyResult

    expect(mockDynamoDbSend).toHaveBeenCalledTimes(1)
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual(expectedUser)
    expect(JSON.parse(result.body)).not.toHaveProperty('password')
  })

  test('should return 400 when the user is not found', async () => {
    mockDynamoDbSend.mockResolvedValue({})
    const result = (await handler(
      getEvent(),
      getContext(),
      vi.fn()
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      error: { message: 'User not found' },
    })
  })

  test('should reject missing authorization', async () => {
    const event = getEvent()
    event.headers.authorization = ''
    const callback = vi.fn()
    await handler(event, getContext(), callback)

    expect(callback).toHaveBeenCalled()
    const [, result] = callback.mock.calls[0] as [unknown, APIGatewayProxyResult]
    expect(result.statusCode).toBe(401)
    expect(mockDynamoDbSend).not.toHaveBeenCalled()
  })
})
