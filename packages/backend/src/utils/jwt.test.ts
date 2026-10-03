import { expect, test, vi } from 'vitest'
import { createJWT, verifyJWT, jwtMiddleware } from './jwt.js'
import { getContext, getEvent } from './test-utils.js'

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItaWQifQ.GgC54G9TQ7iS0kdx5zQ0otdRBvfRSJqREu9O4TyJ7Wg'

for (const authorization of ['', 'Basic token', 'Bearer invalid']) {
  test(`returns 401 without a callback for ${authorization || 'missing authorization'}`, async () => {
    const next = vi.fn()
    const event = getEvent()
    event.headers = { authorization }
    const handler = jwtMiddleware(next, 'test-secret')
    const response = await handler(event, getContext())
    expect(response.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })
}

test('passes authenticated requests and returns the handler response', async () => {
  const response = { statusCode: 200, body: 'ok' }
  const next = vi.fn().mockResolvedValue(response)
  const event = getEvent()
  event.headers = { authorization: `Bearer ${createJWT({ id: 'user-id' }, 'test-secret')}` }
  const context = getContext()
  await expect(jwtMiddleware(next, 'test-secret')(event, context)).resolves.toEqual(response)
  expect(next).toHaveBeenCalledWith(event, context)
  expect(event.requestContext.authorizer).toEqual({ userId: 'user-id' })
})

test('propagates errors from an authenticated handler', async () => {
  const error = new Error('handler failed')
  const next = vi.fn().mockRejectedValue(error)
  const event = getEvent()
  event.headers = { authorization: `Bearer ${createJWT({ id: 'user-id' }, 'test-secret')}` }
  await expect(jwtMiddleware(next, 'test-secret')(event, getContext())).rejects.toBe(error)
})

test('creates a JWT matching the standard HS256 fixture', () => {
  expect(createJWT({ id: 'user-id' }, 'test-secret')).toBe(testToken)
})

test('accepts a standard HS256 signature', () => {
  expect(verifyJWT(testToken, 'test-secret')).toBe('user-id')
})

test('rejects tokens with the legacy double-encoded signature', async () => {
  const legacyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItaWQifQ.R2dDNTRHOVRRN2lTMGtkeDV6UTBvdGRSQnZmUlNKcVJFdTlPNFR5SjdXZz0'
  expect(verifyJWT(legacyToken, 'test-secret')).toBeNull()
  const event = getEvent()
  event.headers = { authorization: `Bearer ${legacyToken}` }
  const next = vi.fn()
  expect((await jwtMiddleware(next, 'test-secret')(event, getContext())).statusCode).toBe(401)
  expect(next).not.toHaveBeenCalled()
})

test('rejects a wrong signing key or tampered payload', () => {
  expect(verifyJWT(testToken, 'wrong-secret')).toBeNull()
  const [header, , signature] = testToken.split('.')
  const changedPayload = Buffer.from(JSON.stringify({ id: 'another-user' })).toString('base64url')
  expect(verifyJWT(`${header}.${changedPayload}.${signature}`, 'test-secret')).toBeNull()
})
