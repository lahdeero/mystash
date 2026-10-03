import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import axios from 'axios'
import { handler as initLogin } from './github-login.js'
import { verifyGithubHandler } from './github-verify.js'
import { createOAuthState } from '../utils/oauth-state.js'
import { getContext, getEvent } from '../utils/test-utils.js'

vi.mock('axios', () => ({ default: { post: vi.fn(), get: vi.fn() } }))
vi.mock('../services/userService.js', () => ({
  UserService: class {
    async searchGithubUser() {
      return { id: 'user-1', nickname: 'Test', email: 'test@example.com', tier: 'free' }
    }
  },
}))

const nonce = 'a'.repeat(64)
const secret = process.env.SECRET!
const attempt = () => ({ code: 'github-code', nonce, state: createOAuthState(nonce, secret) })
const verify = (body: unknown) => verifyGithubHandler(getEvent(JSON.stringify(body), 'POST'))

describe('GitHub OAuth state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(axios.post).mockResolvedValue({ data: { access_token: 'github-token' } })
    vi.mocked(axios.get).mockResolvedValue({ data: { id: 1 } })
  })
  afterEach(() => vi.useRealTimers())

  test('requires a valid browser nonce before redirecting', async () => {
    const event = getEvent()
    expect((await initLogin(event, getContext())).statusCode).toBe(400)
    event.queryStringParameters = { nonce: 'invalid' }
    expect((await initLogin(event, getContext())).statusCode).toBe(400)
  })

  test('redirects with signed state and accepts the matching callback', async () => {
    const event = getEvent()
    event.queryStringParameters = { nonce }
    const redirect = await initLogin(event, getContext())
    expect(redirect.statusCode).toBe(302)
    expect(redirect.headers?.['Cache-Control']).toBe('no-store')
    const state = new URL(String(redirect.headers?.Location)).searchParams.get('state')
    const response = await verify({ code: 'github-code', state, nonce })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body).token).toBeTruthy()
    expect(axios.post).toHaveBeenCalledTimes(1)
  })

  test.each(['missing state', 'missing nonce', 'wrong nonce', 'tampered state', 'malformed state', 'missing code'])('rejects %s before contacting GitHub', async (failure) => {
    const body: Record<string, unknown> = attempt()
    if (failure === 'missing state') delete body.state
    if (failure === 'missing nonce') delete body.nonce
    if (failure === 'wrong nonce') body.nonce = 'b'.repeat(64)
    if (failure === 'tampered state') body.state = `x${body.state}`
    if (failure === 'malformed state') body.state = ['invalid']
    if (failure === 'missing code') delete body.code
    expect((await verify(body)).statusCode).toBe(401)
    expect(axios.post).not.toHaveBeenCalled()
    expect(axios.get).not.toHaveBeenCalled()
  })

  test('rejects expired state before contacting GitHub', async () => {
    vi.useFakeTimers()
    const body = attempt()
    vi.advanceTimersByTime(10 * 60 * 1000)
    expect((await verify(body)).statusCode).toBe(401)
    expect(axios.post).not.toHaveBeenCalled()
  })

  test('rejects state signed with another secret', async () => {
    expect((await verify({ ...attempt(), state: createOAuthState(nonce, 'wrong-secret') })).statusCode).toBe(401)
    expect(axios.post).not.toHaveBeenCalled()
  })

  test('rejects invalid JSON', async () => {
    expect((await verifyGithubHandler(getEvent('{invalid'))).statusCode).toBe(401)
    expect(axios.post).not.toHaveBeenCalled()
  })
})
