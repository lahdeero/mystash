const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const client = require('./db')
const noteRouter = require('./routes/note')
const tagRouter = require('./routes/tag')
const userRouter = require('./routes/user')
const loginRouter = require('./routes/login')

// const router = express.Router()
app.use(bodyParser.json())
app.use(cors())

app.use('/api/notes/directory/', noteRouter)
app.use('/api/notes/tag', tagRouter)
app.use('/api/user', userRouter)
app.use('/api/login', loginRouter)

const server = http.createServer(app)

app.get('/', function (req, res) {
  res.send(`<a href="https://lahdeero.github.io/mystash-frontend/">frontend</a>`)
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
