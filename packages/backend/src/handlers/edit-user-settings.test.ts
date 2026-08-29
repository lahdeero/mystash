import { vi, describe, test, expect, beforeEach } from 'vitest'
import { APIGatewayProxyResult } from 'aws-lambda'
import type { User } from '@mystash/shared'

import { getEvent, getContext } from '../utils/test-utils.js'
import { handler } from './edit-user-settings.js'

const dbItem = {
  id: '9e53ca88-44f3-4210-a5f7-90d4717a3d6a',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  tier: 'free',
  hasAcceptedTerms: false,
  password: 'encrypted-secret', // should never leak to the response
}

const expectedUser = (overrides: Partial<User> = {}): User => ({
  firstName: dbItem.firstName,
  lastName: dbItem.lastName,
  email: dbItem.email,
  tier: dbItem.tier,
  hasAcceptedTerms: dbItem.hasAcceptedTerms,
  ...overrides,
})

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
  UpdateCommand: vi.fn((input: any) => ({ input })),
}))

describe('edit-user-settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockDynamoDbSend.mockResolvedValue({ Attributes: dbItem })
  })

  test('should allow accepting the terms by setting hasAcceptedTerms to true', async () => {
    const result = (await handler(
      getEvent(JSON.stringify({ hasAcceptedTerms: true }), 'PUT'),
      getContext(),
      vi.fn()
    )) as APIGatewayProxyResult

    expect(mockDynamoDbSend).toHaveBeenCalledTimes(1)
    const commandArg = mockDynamoDbSend.mock.calls[0][0]
    expect(commandArg.input.TableName).toBe(process.env.USERS_TABLE_NAME)
    expect(commandArg.input.Key).toEqual({ id: dbItem.id })
    expect(commandArg.input.UpdateExpression).toBe('SET #field0 = :value0')
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual(expectedUser())
    expect(JSON.parse(result.body)).not.toHaveProperty('password')
  })

  test('should allow editing multiple user settings', async () => {
    const updatedAttributes = {
      ...dbItem,
      firstName: 'New',
      lastName: 'Name',
      hasAcceptedTerms: true,
    }
    mockDynamoDbSend.mockResolvedValue({ Attributes: updatedAttributes })

    const result = (await handler(
      getEvent(
        JSON.stringify({ firstName: 'New', lastName: 'Name', hasAcceptedTerms: true }),
        'PUT'
      ),
      getContext(),
      vi.fn()
    )) as APIGatewayProxyResult

    expect(mockDynamoDbSend).toHaveBeenCalledTimes(1)
    const commandArg = mockDynamoDbSend.mock.calls[0][0]
    expect(commandArg.input.UpdateExpression).toBe(
      'SET #field0 = :value0, #field1 = :value1, #field2 = :value2'
    )
    expect(JSON.parse(result.body)).toEqual(
      expectedUser({ firstName: 'New', lastName: 'Name', hasAcceptedTerms: true })
    )
  })

  test('should reject unknown fields with a 400', async () => {
    const result = (await handler(
      getEvent(JSON.stringify({ tier: 'admin' }), 'PUT'),
      getContext(),
      vi.fn()
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      error: { message: 'Field(s) cannot be edited: tier' },
    })
    expect(mockDynamoDbSend).not.toHaveBeenCalled()
  })

  test('should reject an empty body with a 400', async () => {
    const result = (await handler(
      getEvent('{}', 'PUT'),
      getContext(),
      vi.fn()
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      error: { message: 'No settings provided' },
    })
    expect(mockDynamoDbSend).not.toHaveBeenCalled()
  })

  test('should reject a malformed body with a 400', async () => {
    const result = (await handler(
      getEvent('not-json', 'PUT'),
      getContext(),
      vi.fn()
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      error: { message: 'Invalid JSON body' },
    })
    expect(mockDynamoDbSend).not.toHaveBeenCalled()
  })

  test('should reject missing authorization', async () => {
    const event = getEvent(JSON.stringify({ hasAcceptedTerms: true }), 'PUT')
    event.headers.authorization = ''
    const callback = vi.fn()
    await handler(event, getContext(), callback)

    expect(callback).toHaveBeenCalled()
    const [, result] = callback.mock.calls[0] as [unknown, APIGatewayProxyResult]
    expect(result.statusCode).toBe(401)
    expect(mockDynamoDbSend).not.toHaveBeenCalled()
  })
})
