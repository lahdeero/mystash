const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('Authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

module.exports = {
  verifyJWT_MW: function(req, res, next) {
    const token = getTokenFrom(req)
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (decodedToken) {
        console.log(decodedToken)
        req.user = decodedToken
        next()
      }
    } catch (err) {
      res.status(400).json({ error: 'invalid token' })
    }
  }
}
