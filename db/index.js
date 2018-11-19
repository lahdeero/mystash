// const { Pool } = require('pg')
const pg = require('pg')

require('dotenv').config()

const config = {
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  max: 10, // max number of connection can be open to database
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
}

const pool = new pg.Pool(config)

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
  release: () => pool.end()
}

