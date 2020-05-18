const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const client = require('../db')
const passport = require('passport')
// const ExtractJwt = require('passport-jwt')
const queryString = require('query-string')
const GitHubStrategy = require('passport-github2').Strategy

loginRouter.use(passport.initialize())

passport.serializeUser(function (user, done) {
  console.log('serialize')
  done(null, user)
})

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  // clientID: GITHUB_CLIENT_ID,
  // clientSecret: GITHUB_CLIENT_SECRET,
  // callbackURL: "http://127.0.0.1:3000/auth/github/callback"
},
  function (accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //   return done(err, user)
    // })
    process.nextTick(function () {
      // console.log('profile:', profile)
      return done(null, profile)
    })
  }
))

loginRouter.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
)

const createUser = async (ghuser) => {
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
  const createduser = {
    username: username,
    realname: displayName,
    id: accountId,
    github_id: ghuser.id,
    tier: 1,
    email: _json.email
  }
  return createduser
}

const findOrCreateUser = async (ghuser) => {
  // console.log('ghuser', ghuser)
  const res = await client.query('SELECT * FROM account WHERE github_id = ($1) LIMIT 1', [ghuser.id])
  let data = res.rows[0]
  // console.log('data', data)

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
    console.log('callback authentikaatio onnistui')
    // console.log('request user', req.user)

    try {
      // const passwordCorrect = data === null ? false : await bcrypt.compare(body.password, data.password)
      const user = await findOrCreateUser(req.user)
      const token = jwt.sign(user, process.env.SECRET)

      console.log('successful login: ', user.username)
      // res.redirect(process.env.NODE_ENV === 'dev' ? 'http://localhost:3000?token=' + token : process.env.FRONTEND_URL + '?token=' + token)
      const redirect_url = `${process.env.FRONTEND_URL}?token=${token}`
      res.redirect(redirect_url)
    } catch (exception) {
      console.log('failed login, user: ' + req.user.displayName)
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
