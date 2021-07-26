const pool = require('../db')

class Note {
  constructor(row) {
    this.id = row.id
    this.title = row.title
    this.content = row.content
    this.tags = row.tags
    this.updated_at = row.updated_at
  }
  toJSON() {
    return Object.getOwnPropertyNames(this).reduce((a, b) => {
      a[b] = this[b]
      return a
    }, {})
  }
}

const findOne = async (noteId, userId) => {
  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT note.id, title, content, updated_at, array_agg(tag.name) as tags FROM note \
    LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id \
    WHERE note.id=($1) AND account_id = ($2) GROUP BY note.id', [noteId, userId])
    const note = new Note(rows[0])
    return note
  } catch (e) {
    console.log(e)
  } finally {
    client.release()
  }
}

const addTags = async (noteId, currentTags, bodyTags) => {
  const client = await pool.connect()
  const currentTagsNames = currentTags.map(ctag => ctag.name)
  try {
    bodyTags.forEach(async (tag) => {
      if (!currentTagsNames.includes(tag)) {
        let tagId = null
        const second = await client.query('SELECT tag.id FROM tag WHERE name = ($1)', [tag])
        if (second.rows[0]) {
          tagId = second.rows[0].id
        } else {
          const third = await client.query('INSERT INTO tag(name) VALUES($1) Returning id', [tag])
          tagId = third.rows[0].id
        }
        console.log('tagId:', tagId)
        await client.query('INSERT INTO notetag(note_id, tag_id) VALUES ($1, $2)', [noteId, tagId])
      }
    })
  } catch (e) {
    console.log(e)
  } finally {
    client.release()
  }
}

const deleteTags = async (noteId, currentTags, bodyTags) => {
  const client = await pool.connect()
  try {
    currentTags.forEach(async (row) => {
      if (!bodyTags.includes(row.name)) {
        await client.query('DELETE FROM notetag WHERE note_id = ($1) AND tag_id = ($2)', [noteId, row.tag_id])
      }
    })
  } catch (e) {
    console.log(e)
  } finally {
    client.release()
  }
}

const createBackup = async (noteId, userId) => {
  console.log("Create backup")
  const note = await findOne(noteId, userId)

  const client = await pool.connect()
  let id = null
  try {
    const rows = await client.query(`INSERT INTO backupnote(note_id, title,content,account_id,updated_at,created_at)
      VALUES($1, $2, $3, $4, NOW(),NOW()) RETURNING id`, [note.id, note.title, note.content, userId])
    id = rows.rows[0].id
  } catch (e) {
    console.log(e)
  } finally {
    client.release()
  }

  if (id) console.log("Created backup", id)
}

module.exports = { findOne, addTags, deleteTags, createBackup }
