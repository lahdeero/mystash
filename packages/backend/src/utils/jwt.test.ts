import { expect, test, vi } from 'vitest'
import { createJWT, jwtMiddleware } from './jwt.js'
import { getContext, getEvent } from './test-utils.js'

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
