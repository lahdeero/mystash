import { createHmac, timingSafeEqual } from 'node:crypto'

const NONCE_PATTERN = /^[a-f0-9]{64}$/
const STATE_TTL_MS = 10 * 60 * 1000

export const isOAuthNonce = (nonce: unknown): nonce is string =>
  typeof nonce === 'string' && NONCE_PATTERN.test(nonce)

const sign = (payload: string, secret: string) =>
  createHmac('sha256', secret).update(`github-oauth-state:${payload}`).digest()

export const createOAuthState = (nonce: string, secret: string): string => {
  const payload = Buffer.from(JSON.stringify({ nonce, expiresAt: Date.now() + STATE_TTL_MS })).toString('base64url')
  return `${payload}.${sign(payload, secret).toString('base64url')}`
}

export const verifyOAuthState = (state: unknown, nonce: unknown, secret: string): boolean => {
  if (typeof state !== 'string' || state.length > 512 || !isOAuthNonce(nonce)) return false
  try {
    const parts = state.split('.')
    if (parts.length !== 2) return false
    const [payload, signature] = parts
    const expected = sign(payload, secret)
    const actual = Buffer.from(signature, 'base64url')
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return decoded.nonce === nonce && Number.isSafeInteger(decoded.expiresAt) && decoded.expiresAt > Date.now()
  } catch {
    return false
  }
}
