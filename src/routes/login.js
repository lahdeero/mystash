const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const client = require('../db')
const User = require('../models/user')
const passport = require('passport')
// const ExtractJwt = require('passport-jwt')
const queryString = require('query-string')
const GitHubStrategy = require('passport-github2').Strategy

loginRouter.use(passport.initialize())

passport.serializeUser(function (user, done) {
  console.log('serialize')
  done(null, user.id)
})

passport.deserializeUser((userId, done) => {
  User.findOne(userId).then(user => {
    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  }).catch(done);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/login/github/callback`
},
  (accessToken, refreshToken, profile, cb) => {
    // User.findUserByGhProfile({ profile: { id, username, realname, email, github_id } }, (err, user) => {
    // User.findUserByGhProfile(profile)
    User.findOrCreateUser(profile)
      .then(user => {
        console.log('user', user)
        return cb(null, user)
      })
      .catch(e => {
        return cb(null, false, { error: 'No user found' })
      })
  })
)


loginRouter.get('/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
    const fronendUrl = process.env.FRONTEND_URL
    res.redirect(fronendUrl)
  }
)

const createUser = async (ghuser) => {
  // console.log('ghuser', ghuser)
  const today = new Date()
  // console.log('passportuser', passportuser)
  const { username, displayName, _json } = ghuser
  console.log(username)
  console.log(displayName)
  console.log(_json.email)
  console.log(1)
  console.log(today)
  const { rows } = await client.query('INSERT INTO account (username,realname,email,github_id,tier,register_date) VALUES ($1, $2, $3, $4, 1, NOW()) RETURNING id',
    [username, displayName, _json.email, ghuser.id])
  console.log('eioo')
  const accountId = rows[0].id
  console.log('accid', accountId)
  const user = {
    username: username,
    realname: displayName,
    id: accountId,
    github_id: ghuser.id,
    tier: 1,
    email: _json.email
  }
  return user
}

const findOrCreateUser = async (profile) => {
  const ghuser = profile.profile
  // console.log('ghuser', ghuser)
  const res = await User.findUserByGhId(ghuser.id)
  let data = res.rows[0]

  if (!data) {
    const foo = await client.query('SELECT * FROM account WHERE email = ($1) LIMIT 1', [ghuser._json.email])
    // console.log('foo', foo.rows[0])
    const findbyemail = foo.rows[0] ? foo.rows[0].email : null
    // console.log('fbem', findbyemail)
    if (findbyemail) {
      await client.query('UPDATE account SET github_id = ($1) WHERE email = ($2)', [ghuser.id, findbyemail])[0]
      const resagain = await client.query('SELECT * FROM account WHERE github_id = ($1) LIMIT 1', [ghuser.id])
      data = resagain.rows[0]
    }
  }

  const usermade = data ? {
    username: data.username,
    realname: data.realname,
    id: data.id,
    github_id: data.github_id,
    tier: data.tier,
    email: data.email
  } : await createUser(ghuser)

  console.log('usedmade', usermade)

  return usermade
}

loginRouter.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    console.log('callback authentikaatio onnistui', req.username)

    try {
      const token = jwt.sign(req.user, process.env.SECRET)
      console.log('successful login: ', req.user.email)
      const redirect_url = `${process.env.FRONTEND_URL}?token=${token}`
      res.redirect(redirect_url)
    } catch (exception) {
      console.log('failed github login, user: ' + req.user.email)
      return res.status(401).json({ error: 'github login failed' })
    }
  })


loginRouter.post('/', async (request, response) => {
  const body = request.body
  console.log('LOGIN ATTEMPT', body.username)
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
  }
})

module.exports = loginRouter
