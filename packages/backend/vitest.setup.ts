import { vi } from 'vitest'
vi.mock('./src/utils/token-revocation.js', () => ({ isTokenRevoked: vi.fn().mockResolvedValue(false), revokeToken: vi.fn() }))
process.env.JWT_SECRET = 'test_secret_not_for_real_use_32c'
process.env.OAUTH_STATE_SECRET = 'separate-oauth-test-secret'
process.env.LEGACY_PASSWORD_SECRET = '12345678901234567890123456789012'
process.env.USERS_TABLE_NAME = 'mystash-test-users'
process.env.NOTES_TABLE_NAME = 'mystash-test-notes'
