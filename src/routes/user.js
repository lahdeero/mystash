const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const usersRouter = require('express').Router()
const pool = require('../db')

function alphanumeric(inputtxt) {
  var letters = /^[0-9a-zA-Z]+$/
  if (letters.test(inputtxt)) {
    return true
  } else {
    return false
  }
}

const initialNote = {
  id: 1,
  title: 'Welcome to mystash!',
  content: '# Welcome! \n\n Notes are rendered with markdown when having markdown tag.',
  tags: ['welcome, initial, markdown']
}

const getTokenFrom = (request) => {
  const authorization = request.get('Authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

usersRouter.get('/', async (request, response) => {
  const client = await pool.connect()
  try {
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    const first = await client.query('SELECT id,username,realname,email,tier FROM account WHERE username = ($1) AND id=($2) LIMIT 1', [decodedToken.username, decodedToken.id])
    const user = first.rows[0]

    console.log('sending users data')
    response.status(200).send(user)
  } catch (exception) {
    console.log(exception)
    response.status(404).json({ error: 'something went wrong..' })
  } finally {
    client.release()
  }
})

/**
 * Register new user
 */
usersRouter.post('/', async (request, response) => {
  const body = request.body
  if (!body.username || !body.password) {
    return response.status(400).json({ error: 'No username or password' })
  } else if (alphanumeric(body.username) === false) {
    console.log('inavlid name2')
    return response.status(406).json({ error: 'Username can not include special characters' })
  } else {
    console.log('username fine')
    console.log(body.username)
  }

  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT COUNT(username) FROM account WHERE username=($1)', [body.username.toLowerCase()])
    if (rows[0].count !== '0') {
      return response.status(401).json({ error: 'Username not available' })
    }
  } catch (exception) {
    console.log(exception)
    return response.status(500).json({ error: 'Could not SELECT count(username) when registering new user' })
  }

  try {
    console.log(body)

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
    // console.log('passwordHash', passwordHash)

    const today = new Date()

    const { rows } = await client.query(`INSERT INTO account \
      (username,password,realname,email,tier,register_date) \
      VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
      [body.username.toLowerCase(), passwordHash, body.realname, body.email, 1, today])
    const accountId = rows[0].id

    generateWelcome(accountId)

    const res = await client.query(`SELECT id,username,realname,email,tier FROM account \
      WHERE username = ($1) AND id=($2) LIMIT 1`, [body.username.toLowerCase(), accountId])
    const user = res.rows[0]

    const userForToken = {
      username: user.username,
      realname: user.realname,
      id: user.id,
      tier: user.tier,
      email: user.email
    }
    const token = jwt.sign(userForToken, process.env.SECRET)
    console.log('successfully registered')
    response.status(200).send({ token, user })
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'Error while registering new user' })
  } finally {
    client.release()
  }
})

async function generateWelcome(accountId) {
  const client = await pool.connect()
  try {
    client.query('BEGIN')
    const title = initialNote.title
    console.log('title = ', title)
    const content = initialNote.content
    const { rows } = await client.query('INSERT INTO note(title,content,account_id) VALUES( $1, $2, $3) RETURNING id', [title, content, accountId])
    const noteId = rows[0].id
    const tag = 'initial'
    const selectRes = await client.query('SELECT id FROM tag WHERE name = ($1)', [tag])
    let tagId
    if (selectRes.rows[0] === undefined) {
      const insertRes = await client.query('INSERT INTO tag(name) VALUES($1) RETURNING id', [tag])
      tagId = insertRes.rows[0].id
    } else if (selectRes.rows[0] !== undefined) {
      tagId = selectRes.rows[0].id
    }
    await client.query('INSERT INTO notetag(note_id, tag_id) VALUES ($1, $2)', [noteId, tagId])
    client.query('COMMIT')
    return noteId
  } catch (exception) {
    client.query('ROLLBACK')
    console.log(exception)
  } finally {
    client.release()
  }

  return 0
}

module.exports = usersRouter
