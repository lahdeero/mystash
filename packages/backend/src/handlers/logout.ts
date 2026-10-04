import { jwtMiddleware } from '../utils/jwt.js'
import { revokeToken } from '../utils/token-revocation.js'

export const handler = jwtMiddleware(async (event) => {
  const authorization = event.headers.Authorization || event.headers.authorization!
  await revokeToken(authorization.split(' ')[1])
  return { statusCode: 204, body: '' }
}, process.env.JWT_SECRET!)
