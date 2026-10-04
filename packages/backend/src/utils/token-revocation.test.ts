import { expect, test, vi } from 'vitest'
import { createJWT } from './jwt.js'

vi.unmock('./token-revocation.js')
const { send } = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock('@aws-sdk/client-dynamodb', () => ({ DynamoDBClient: vi.fn(function () {}) }))
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: { from: () => ({ send }) },
  GetCommand: class { constructor(public input: unknown) {} },
  PutCommand: class { constructor(public input: unknown) {} },
}))
import { isTokenRevoked, revokeToken } from './token-revocation.js'

test('persists revocation and checks it with a consistent read', async () => {
  const token = createJWT({ id: 'user', exp: 4102444800 }, 'secret')
  send.mockResolvedValueOnce({})
  expect(await isTokenRevoked(token)).toBe(false)
  send.mockResolvedValueOnce({})
  await revokeToken(token)
  const item = send.mock.calls[1][0].input.Item
  expect(item).toEqual({ id: expect.stringMatching(/^revoked-token:[a-f0-9]{64}$/), expiresAt: 4102444800 })
  expect(JSON.stringify(item)).not.toContain(token)
  send.mockResolvedValueOnce({ Item: item })
  expect(await isTokenRevoked(token)).toBe(true)
  expect(send.mock.calls[2][0].input).toEqual({ TableName: process.env.USERS_TABLE_NAME, Key: { id: item.id }, ConsistentRead: true })
})

test('fails closed when the revocation store is unavailable', async () => {
  send.mockRejectedValueOnce(new Error('unavailable'))
  await expect(isTokenRevoked('token')).rejects.toThrow('unavailable')
})
