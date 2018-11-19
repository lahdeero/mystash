const express = require('express')
const mountRoutes = require('./routes')
const db = require('./db')
const router = require('express').Router()

const app = express()

mountRoutes(app)

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM muistiinpano')
  res.send(rows[0])
})

