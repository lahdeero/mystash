import { vi, describe, test, expect } from 'vitest'
import { afterEach } from 'node:test'
import { APIGatewayProxyResult } from 'aws-lambda'

import { Note } from '../types/types'
import { getContext, getEvent } from '../utils/test-utils'
import { handler } from './get-notes'

let testNotes: Note[]

afterEach(() => {
  vi.resetAllMocks()
})

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn(() => ({})),
}))
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: vi.fn(() => ({
      send: vi.fn(() => ({ Items: testNotes })),
    })),
  },
  QueryCommand: vi.fn(),
}))

describe('get-notes', () => {
  const testNote: Note = {
    id: 'f1626fa2-8fe9-48f3-aca3-7d64d65f84f7',
    content: 'test-content',
    tags: ['test-tag'],
    title: 'test-title',
    updatedAt: '2022-06-25T16:35:12.882Z',
    createdAt: '2024-10-11T15:59:16.551Z',
    userId: '9f53ca88-44f3-4210-a5f7-90d4717z3d6q',
  }
  testNotes = [testNote]
  describe('getNotesHandler', () => {
    test('should return notes', async () => {
      const result = (await handler(
        getEvent(),
        getContext(),
        vi.fn()
      )) as APIGatewayProxyResult
      expect(result.statusCode).toBe(200)
      expect(testNotes[0].id).toBe(testNote.id)
      expect(result.body).toBe(JSON.stringify(testNotes, null, 2))
    })
  })
})
