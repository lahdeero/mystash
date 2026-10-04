import { createCipheriv } from 'node:crypto'
import { beforeEach, expect, test, vi } from 'vitest'
import { loginHandler } from './login.js'
import { hashPassword, verifyPassword } from '../utils/cryptography.js'
import { getEvent } from '../utils/test-utils.js'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock('@aws-sdk/client-dynamodb', () => ({ DynamoDBClient: vi.fn(function () {}) }))
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: { from: () => ({ send }) },
  QueryCommand: class { constructor(public input: unknown) {} },
  UpdateCommand: class { constructor(public input: unknown) {} },
}))
const login = (password: string) => loginHandler(getEvent(JSON.stringify({ email: 'test@example.com', password })))
beforeEach(() => { vi.clearAllMocks() })

test('logs in with a hash and rejects incorrect passwords', async () => {
  const password = await hashPassword('password123')
  send.mockResolvedValue({ Items: [{ id: 'user', password }] })
  expect((await login('password123')).statusCode).toBe(200)
  expect((await login('wrong')).statusCode).toBe(401)
  expect(send).toHaveBeenCalledTimes(2)
})

test('upgrades legacy passwords on successful login only', async () => {
  const secret = process.env.LEGACY_PASSWORD_SECRET!
  const cipher = createCipheriv('aes-256-cbc', secret, secret.slice(0, 16).split('').reverse().join(''))
  const password = cipher.update('password123', 'utf8', 'hex') + cipher.final('hex')
  send.mockResolvedValue({ Items: [{ id: 'user', password }] })
  expect((await login('wrong')).statusCode).toBe(401)
  expect(send).toHaveBeenCalledTimes(1)
  expect((await login('password123')).statusCode).toBe(200)
  const update = send.mock.calls[2][0].input
  expect(update.ConditionExpression).toBe('password = :previous')
  expect(update.ExpressionAttributeValues[':previous']).toBe(password)
  expect(await verifyPassword('password123', update.ExpressionAttributeValues[':hash'])).toBe(true)
})

test('does not log nested password records or submitted passwords', async () => {
  const info = vi.spyOn(console, 'info').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  send.mockResolvedValue({ Items: [{ id: 'user', password: 'stored-password-one' }, { password: 'stored-password-two' }] })
  try {
    expect((await login('submitted-password')).statusCode).toBe(401)
    const output = JSON.stringify([...info.mock.calls, ...error.mock.calls])
    for (const password of ['stored-password-one', 'stored-password-two', 'submitted-password']) expect(output).not.toContain(password)
  } finally {
    info.mockRestore()
    error.mockRestore()
  }
})
