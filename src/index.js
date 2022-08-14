const http = require('http')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const client = require('./db')
const noteRouter = require('./routes/note')
const tagRouter = require('./routes/tag')
const userRouter = require('./routes/user')
const loginRouter = require('./routes/login')

const app = express()
app.use(express.static('public'))
app.use('/mystash-frontend/static', express.static(path.join(__dirname, "../public/static")))
console.log("__dirname", __dirname)
app.use(bodyParser.json())
app.use(cors())

// Sessions
app.use(express.urlencoded({extended: false}))
//Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false ,
    saveUninitialized: true ,
}))

app.use('/api/notes/directory/', noteRouter)
app.use('/api/notes/tag', tagRouter)
app.use('/api/user', userRouter)
app.use('/api/login', loginRouter)

const server = http.createServer(app)

app.get('/ping', function (_req, res) {
  res.send(`<html><body>Hello from backend! Timestamp: ${Date()}</body></html>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

server.on('close', () => {
  client.end(() => {
    console.log('postgres pool has ended')
  })
})

module.exports = {
  app, server
}
