const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const client = require('../db')

loginRouter.post('/', async (request, response) => {
  const body = request.body
  console.log('LOGIN ATTEMPT')
  if (!body.username || !body.password) {
    return response.status(401).json({ error: 'no username or password' })
  }

  try {
    const res = await client.query('SELECT * FROM account WHERE username = ($1) LIMIT 1', [body.username.toLowerCase()])
    const user = res.rows[0]

    const passwordCorrect = user === null ? false : await bcrypt.compare(body.password, user.password)

    if (!(user && passwordCorrect)) {
      console.log('failed login, user: ' + body.username.toLowerCase())
      return response.status(401).json({ error: 'invalid username or password' })
    }

    const userForToken = {
      username: user.username,
      id: user.id,
      tier: user.tier
    }
    const token = jwt.sign(userForToken, process.env.SECRET)
    console.log('successful login')
    response.status(200).send({ token, id: user.id })
  } catch (exception) {
    console.log('failed login, user: ' + body.username)
    return response.status(401).json({ error: 'invalid username or password' })
  }
})

module.exports = loginRouter
