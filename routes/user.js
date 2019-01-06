const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const client = require('../db')


usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const today = new Date();

    const { rows } = await client.query('INSERT INTO account(username,password,realname,tier,register_date) VALUES($1, $2, $3, $4, $5) RETURNING id', [body.username,passwordHash,body.realname,1,today])
    const savedUser = await rows[0]

    response.json(savedUser)
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = usersRouter