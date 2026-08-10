import { ErrorResponse } from "@mystash/shared"

export const noAccess = (body: string) => ({
  statusCode: 401,
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ error: { message: body } } satisfies ErrorResponse),
})

export const badRequest = (body: string) => ({
  statusCode: 400,
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ error: { message: body } } satisfies ErrorResponse)
})
