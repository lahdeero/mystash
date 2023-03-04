const { Pool } = require('pg')

require('dotenv').config()

console.log('node_env = ', process.env.NODE_ENV)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: false,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
  end: () => client.end()
}
