import API from 'axios'
import { afterEach, expect, test, vi } from 'vitest'
import loginService from './loginService'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

test('sends the current token for server revocation', async () => {
  localStorage.setItem('MS_token', 'current-token')
  const post = vi.spyOn(API, 'post').mockResolvedValue({ status: 204 })
  await expect(loginService.logout()).resolves.toBeUndefined()
  expect(post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/logout$/), {}, { headers: { Authorization: 'Bearer current-token' } })
})

test('allows local logout when the server rejects an invalid session', async () => {
  vi.spyOn(API, 'post').mockRejectedValue({ isAxiosError: true, response: { status: 401 } })
  await expect(loginService.logout()).resolves.toBeUndefined()
})

test.each`
  status
  ${403}
  ${404}
  ${500}
  ${503}
`('preserves errors for HTTP $status so logout can be retried', async ({ status }) => {
  const error = { isAxiosError: true, response: { status } }
  vi.spyOn(API, 'post').mockRejectedValue(error)
  await expect(loginService.logout()).rejects.toBe(error)
})

test('preserves network errors so logout can be retried', async () => {
  const error = { isAxiosError: true, code: 'ERR_NETWORK' }
  vi.spyOn(API, 'post').mockRejectedValue(error)
  await expect(loginService.logout()).rejects.toBe(error)
})
