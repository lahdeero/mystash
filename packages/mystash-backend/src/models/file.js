const pool = require('../db')

class File {
  constructor(row) {
    this.id = row.id
    this.fieldname = row.fieldname
    this.originalname = row.originalname
    this.encoding = row.encoding
    this.mimetype = row.mimetype
    this.size = row.size
    this.destination = row.destination
    this.filename = row.filename
    this.path = row.path
    this.buffer = row.buffer
    this.noteId = row.note_id
    this.accountId = row.account_id
    this.createdAt = row.created_at
    this.updatedAt = row.updated_at
  }
  toJSON() {
    return Object.getOwnPropertyNames(this).reduce((a, b) => {
      a[b] = this[b]
      return a
    }, {})
  }
}

const create = async (file, accountId, noteId) => {
  console.log("file", file)
  const client = await pool.connect()
  try {
    const result = await client.query(
      `INSERT INTO file( \
        fieldname, originalname, encoding, \
        mimetype, size, destination, \
        filename, path, buffer, \
        note_id, account_id, updated_at, \
        created_at
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING *`,
      [file.fieldname, file.originalname, file.encoding,
        file.mimetype, file.size, file.destination,
        file.filename, file.path, file.buffer,
        noteId, accountId
      ]
    )
    console.log("rows", result.rows)
    return new File(result.rows[0])
  } catch (exception) {
    console.error(exception)
  } finally {
    client.release()
  }
}


const findOne = async (fileId, accountId) => {
  console.log("fileId", fileId)
  console.log("accountId", accountId)
  const client = await pool.connect()
  try {
    const { rows } = await client.query(
      'SELECT * FROM file WHERE file.id=($1) AND account_id=($2) GROUP BY file.id',
      [fileId, accountId]
    )
    console.log("rows", rows)
    return new File(rows[0])
  } catch (exception) {
    console.log(exception)
  } finally {
    client.release()
  }
}

module.exports = { create, findOne }
