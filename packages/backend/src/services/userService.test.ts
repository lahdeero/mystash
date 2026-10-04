import { expect, test, vi } from 'vitest'
import { UserService } from './userService.js'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock('@aws-sdk/client-dynamodb', () => ({ DynamoDBClient: vi.fn(function () {}) }))
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: { from: () => ({ send }) },
  QueryCommand: class { constructor(public input: unknown) {} },
  PutCommand: class { constructor(public input: unknown) {} },
}))

test('returns the GitHub user without logging database records', async () => {
  const info = vi.spyOn(console, 'info').mockImplementation(() => {})
  const user = { id: 'user', password: 'stored-password-one' }
  send.mockResolvedValue({ Items: [user, { password: 'stored-password-two' }] })
  try {
    expect(await new UserService().searchGithubUser(1)).toEqual(user)
    expect(info).not.toHaveBeenCalled()
  } finally {
    info.mockRestore()
  }
})
