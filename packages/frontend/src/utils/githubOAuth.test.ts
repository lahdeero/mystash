import { beforeEach, describe, expect, test } from 'vitest'
import { consumeGitHubOAuth, startGitHubOAuth } from './githubOAuth'

const stateFor = (nonce: string | null, expiresAt = Date.now() + 600000) => `${btoa(JSON.stringify({ nonce, expiresAt })).replace(/=+$/, '')}.signature`

const loginUrl = 'https://api.example.com/api/login/github/init'

describe('GitHub OAuth browser session', () => {
  beforeEach(() => sessionStorage.clear())

  test('generates a random nonce for each attempt and keeps it in session storage', () => {
    const first = new URL(startGitHubOAuth(loginUrl)).searchParams.get('nonce')
    const second = new URL(startGitHubOAuth(loginUrl)).searchParams.get('nonce')
    expect(first).toMatch(/^[a-f0-9]{64}$/)
    expect(second).not.toBe(first)
    const state = stateFor(second)
    expect(consumeGitHubOAuth('code', state)).toEqual({ code: 'code', state, nonce: second })
  })

  test('rejects unsolicited and repeated callbacks', () => {
    expect(() => consumeGitHubOAuth('code', 'signed-state')).toThrow()
    const nonce = new URL(startGitHubOAuth(loginUrl)).searchParams.get('nonce')
    consumeGitHubOAuth('code', stateFor(nonce))
    expect(() => consumeGitHubOAuth('code', 'signed-state')).toThrow()
  })

  test.each`
    code        | state
    ${undefined} | ${'state'}
    ${'code'}    | ${undefined}
    ${['code']}  | ${'state'}
    ${'code'}    | ${['state']}
  `('rejects malformed callback $code, $state and consumes the nonce', ({ code, state }) => {
    startGitHubOAuth(loginUrl)
    expect(() => consumeGitHubOAuth(code, state)).toThrow()
    expect(() => consumeGitHubOAuth('code', 'state')).toThrow()
  })
})

 test('rejects state from another browser session and expired state', () => {
  startGitHubOAuth(loginUrl)
  expect(() => consumeGitHubOAuth('code', stateFor('attacker-nonce'))).toThrow()
  const nonce = new URL(startGitHubOAuth(loginUrl)).searchParams.get('nonce')
  expect(() => consumeGitHubOAuth('code', stateFor(nonce, Date.now()))).toThrow()
})
