const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const client = require('./db')
const config = require('./utils/config')
const noteRouter = require('./routes/note')
const tagRouter = require('./routes/tag')
const systeminfoRouter = require('./routes/systeminfo')

// const router = express.Router()
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('client'))

app.use('/api/notes/directory/', noteRouter)
app.use('/api/notes/tag', tagRouter)
app.use('/api/systeminfo', systeminfoRouter)

const server = http.createServer(app)

app.get('/create', function (req, res) {
	res.json('create')
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
