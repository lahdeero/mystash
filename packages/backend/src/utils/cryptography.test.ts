import { createCipheriv } from 'node:crypto'
import { expect, test } from 'vitest'
import { hashPassword, verifyPassword } from './cryptography.js'

test('uses unique salts and verifies passwords without encryption keys', async () => {
  const first = await hashPassword('correct-password')
  const second = await hashPassword('correct-password')
  expect(first).not.toBe(second)
  expect(first).toMatch(/^scrypt\$131072\$8\$1\$/)
  expect(await verifyPassword('correct-password', first)).toBe(true)
  expect(await verifyPassword('wrong-password', first)).toBe(false)
})

test('supports legacy verification only with the migration secret', async () => {
  const secret = process.env.LEGACY_PASSWORD_SECRET!
  const cipher = createCipheriv('aes-256-cbc', secret, secret.slice(0, 16).split('').reverse().join(''))
  const encrypted = cipher.update('legacy-password', 'utf8', 'hex') + cipher.final('hex')
  expect(await verifyPassword('legacy-password', encrypted)).toBe(true)
  expect(await verifyPassword('wrong-password', encrypted)).toBe(false)
  delete process.env.LEGACY_PASSWORD_SECRET
  try {
    expect(await verifyPassword('legacy-password', encrypted)).toBe(false)
  } finally {
    process.env.LEGACY_PASSWORD_SECRET = secret
  }
})

test.each(['scrypt$1$8$1$aa$bb', 'scrypt$131072$8$1$aa$bb', 'malformed'])('rejects malformed password records', async (stored) => {
  expect(await verifyPassword('password', stored)).toBe(false)
})
