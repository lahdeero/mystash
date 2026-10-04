import { vi } from 'vitest'
vi.mock('./src/utils/token-revocation.js', () => ({ isTokenRevoked: vi.fn().mockResolvedValue(false), revokeToken: vi.fn() }))
process.env.SECRET = 'test_secret_not_for_real_use_32c'
process.env.USERS_TABLE_NAME = 'mystash-test-users'
process.env.NOTES_TABLE_NAME = 'mystash-test-notes'
