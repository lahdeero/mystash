import { createDecipheriv, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const derive = (password: string, salt: Buffer): Promise<Buffer> => new Promise((resolve, reject) => {
  scrypt(password, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 }, (error, key) => {
    if (error) reject(error)
    else resolve(key)
  })
})

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16)
  const key = await derive(password, salt)
  return `scrypt$131072$8$1$${salt.toString('hex')}$${key.toString('hex')}`
}

export const isPasswordHash = (value: string): boolean => value.startsWith('scrypt$')

export const decryptLegacyPassword = (ciphertext: string): string => {
  const secret = process.env.LEGACY_PASSWORD_SECRET
  if (!secret || !/^(?:[a-f0-9]{32})+$/.test(ciphertext)) throw new Error('Legacy password migration unavailable')
  const iv = secret.slice(0, 16).split('').reverse().join('')
  const decipher = createDecipheriv('aes-256-cbc', secret, iv)
  return decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8')
}

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  try {
    if (!isPasswordHash(stored)) {
      const plaintext = decryptLegacyPassword(stored)
      const expected = Buffer.from(plaintext)
      const actual = Buffer.from(password)
      return expected.length === actual.length && timingSafeEqual(expected, actual)
    }
    const parts = stored.split('$')
    if (parts.length !== 6 || parts.slice(0, 4).join('$') !== 'scrypt$131072$8$1' || !/^[a-f0-9]{32}$/.test(parts[4]) || !/^[a-f0-9]{128}$/.test(parts[5])) return false
    const actual = await derive(password, Buffer.from(parts[4], 'hex'))
    return timingSafeEqual(actual, Buffer.from(parts[5], 'hex'))
  } catch {
    return false
  }
}
