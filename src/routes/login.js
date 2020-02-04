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
    const data = res.rows[0]
    // console.log(data)

    const passwordCorrect = data === null ? false : await bcrypt.compare(body.password, data.password)

    if (!(data && passwordCorrect)) {
      console.log('failed login, user: ' + body.username.toLowerCase())
      return response.status(401).json({ error: 'invalid username or password' })
    }

    const user = await {
      username: data.username,
      realname: data.realname,
      id: data.id,
      tier: data.tier,
      email: data.email
    }
    const token = await jwt.sign(user, process.env.SECRET)
    console.log('successful login: ', user.username)
    await response.status(200).send({ token, user })
  } catch (exception) {
    console.log('failed login, user: ' + body.username)
    return response.status(401).json({ error: 'invalid username or password' })
  }
})

module.exports = loginRouter
