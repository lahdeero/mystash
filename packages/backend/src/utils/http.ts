export const noAccess = (body: string) => ({
  statusCode: 401,
  headers: { "content-type": "application/json; charset=utf-8" },
  body,
})
