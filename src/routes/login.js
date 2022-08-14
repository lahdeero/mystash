const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const pool = require('../db')
const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const User = require('../models/user')

/**
 * /api/login
 */

loginRouter.use(passport.initialize())

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
},
  (accessToken, refreshToken, profile, done) => {
    User.findOrCreateUser(profile)
      .then(user => {
        return done(null, user)
      })
      .catch(e => {
        return (null, false, { error: 'No user found' })
      })
  })
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((userId, done) => {
  User.findOne(userId).then(user => {
    done(null, user)
  }).catch(err => done(err))
})


loginRouter.get('/github',
  passport.authenticate('github')
)

loginRouter.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = jwt.sign(req.user, process.env.SECRET)
      const redirect_url = `${process.env.FRONTEND_URL}?token=${token}`
      res.redirect(redirect_url)
    } catch (exception) {
      console.log('failed login, user: ' + req.user.username)
      return res.status(401).json({ error: 'github login failed' })
    }
  }
)

loginRouter.post('/', async (request, response) => {
  const body = request.body
  console.log('PASSWORD LOGIN ATTEMPT', body.username)
  if (!body.username || !body.password) {
    return response.status(401).json({ error: 'no username or password' })
  }

  const client = await pool.connect()
  try {
    const res = await client.query('SELECT * FROM account WHERE username = ($1) LIMIT 1', [body.username.toLowerCase()])
    const data = res.rows[0]
    // console.log(data)

    const passwordCorrect = data === null ? false : await bcrypt.compare(body.password, data.password)

    if (!(data && passwordCorrect)) {
      console.log('failed login, user: ' + body.username.toLowerCase())
      return response.status(401).json({ error: 'invalid username or password' })
    }

    const user = {
      username: data.username,
      realname: data.realname,
      id: data.id,
      tier: data.tier,
      email: data.email
    }
    const token = jwt.sign(user, process.env.SECRET)
    console.log('successful login: ', user.username)
    response.status(200).send({ token, user })
  } catch (exception) {
    console.log('failed login, user: ' + body.username)
    return response.status(401).json({ error: 'invalid username or password' })
  } finally {
    client.release()
  }
})

module.exports = loginRouter
