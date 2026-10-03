import { beforeEach, describe, expect, test } from 'vitest'
import { consumeGitHubOAuth, startGitHubOAuth } from './githubOAuth'

const loginUrl = 'https://api.example.com/api/login/github/init'

describe('GitHub OAuth browser session', () => {
  beforeEach(() => sessionStorage.clear())

  test('generates a random nonce for each attempt and keeps it in session storage', () => {
    const first = new URL(startGitHubOAuth(loginUrl)).searchParams.get('nonce')
    const second = new URL(startGitHubOAuth(loginUrl)).searchParams.get('nonce')
    expect(first).toMatch(/^[a-f0-9]{64}$/)
    expect(second).not.toBe(first)
    expect(consumeGitHubOAuth('code', 'signed-state')).toEqual({ code: 'code', state: 'signed-state', nonce: second })
  })

  test('rejects unsolicited and repeated callbacks', () => {
    expect(() => consumeGitHubOAuth('code', 'signed-state')).toThrow()
    startGitHubOAuth(loginUrl)
    consumeGitHubOAuth('code', 'signed-state')
    expect(() => consumeGitHubOAuth('code', 'signed-state')).toThrow()
  })

  test.each([[undefined, 'state'], ['code', undefined], [['code'], 'state'], ['code', ['state']]])('rejects malformed callback %j, %j and consumes the nonce', (code, state) => {
    startGitHubOAuth(loginUrl)
    expect(() => consumeGitHubOAuth(code, state)).toThrow()
    expect(() => consumeGitHubOAuth('code', 'state')).toThrow()
  })
})
