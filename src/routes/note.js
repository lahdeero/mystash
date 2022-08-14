const noteRouter = require('express').Router()
const pool = require('../db')
const verifyJWT = require('../middlewares/verifyJWT')
const Note = require('../models/note')

noteRouter.all('*', verifyJWT.verifyJWT_MW)

noteRouter.get('/all', async (req, res) => {
  const user = req.user
  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT note.id, title, content, note.updated_at, array_agg(tag.name) as tags FROM note  \
    LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id \
    LEFT JOIN account ON account.id = note.account_id WHERE account.id = ($1) \
    GROUP BY note.id ORDER BY updated_at DESC NULLS LAST', [user.id])
    res.send(rows)
  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'could not get notes' })
  } finally {
    client.release()
  }
})

noteRouter.get('/note/:id', async (req, res) => {
  const user = req.user
  const noteId = parseInt(req.params.id)
  try {
    const note = await Note.findOne(noteId, user.id)
    res.send(note.toJSON())
  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'failed to get note!' })
  }
})

resolveTagId = async (tag, client) => {
  const tagRow = await client.query('SELECT id FROM tag WHERE name = ($1)', [tag])
  if (tagRow.rows[0] === undefined) {
    const insertRes = await client.query('INSERT INTO tag(name) VALUES($1) RETURNING id', [tag])
    return insertRes.rows[0].id
  }
  return tagRow.rows[0].id
}

noteRouter.post('/', async (req, res) => {
  const user = req.user
  const body = req.body
  validateRequest(body)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query('INSERT INTO note(title,content,account_id,updated_at,created_at) VALUES($1, $2, $3, NOW(),NOW()) RETURNING id', [body.title, body.content, user.id])
    const noteId = rows[0].id

    console.log('body.tags', body.tags)
    const tags = body.tags.length === 0 ? ['undefined'] : body.tags
    await tags.forEach(async (tag) => {
      const tagId = await resolveTagId(tag, client)
      const insertNoteTag = 'INSERT INTO notetag(note_id, tag_id) VALUES ($1, $2)'
      const insertNoteTagValues = [noteId, tagId]
      await client.query(insertNoteTag, insertNoteTagValues)
    })
    await client.query('COMMIT')
    const note = await Note.findOne(noteId, user.id)
    console.log(note.toJSON())
    res.json(note.toJSON())
  } catch (exception) {
    await client.query('ROLLBACK')
    console.log(exception)
    res.status(400).send('Could not add note! ' + exception)
  } finally {
    client.release()
  }
})

noteRouter.put('/note/:id', async (req, res) => {
  const user = req.user
  const noteId = parseInt(req.params.id)
  if (noteId === undefined || !Number.isInteger(noteId)) return res.status(400).send('No id')
  const body = req.body
  validateRequest(body)

  await Note.createBackup(noteId, user.id)
  const client = await pool.connect()
  try {
    client.query('BEGIN')

    const first = await client.query('SELECT tag.name, notetag.note_id, notetag.tag_id FROM notetag LEFT JOIN tag ON tag.id = notetag.tag_id WHERE notetag.note_id = ($1)', [noteId])
    const currentTags = first.rows
    await Note.deleteTags(noteId, currentTags, body.tags)
    await Note.addTags(noteId, currentTags, body.tags)
    await client.query(
      'UPDATE note SET title =($1), content =($2), updated_at=NOW() WHERE note.id =($3) AND account_id =($4) RETURNING id',
      [body.title, body.content, noteId, user.id]
    )
    await client.query('COMMIT')

    const note = await Note.findOne(noteId, user.id)
    return res.json(note.toJSON())
  } catch (error) {
    client.query('ROLLBACK')
    console.log(error)
    return res.status(400).send({ message: 'Could not update note', error })
  } finally {
    client.release()
  }
})

noteRouter.delete('/note/:id', async (req, res) => {
  const user = req.user
  const noteId = parseInt(req.params.id)
  if (noteId === undefined || !Number.isInteger(noteId)) return res.status(400).json('Id missing')

  const client = await pool.connect()
  try {
    await client.query('DELETE FROM note WHERE id = ($1) AND account_id = ($2)', [noteId, user.id])
    return res.status(200).json(noteId)
  } catch (exception) {
    await client.query('ROLLBACK')
    return res.status(500).json({ error: 'Could not delete note ' + noteId })
  } finally {
    client.release()
  }
})

const validateRequest = (body) => {
  if (body.title === undefined) return res.status(400).json({ error: 'title missing' })
  else if (body.content === undefined) return res.status(400).json({ error: 'contetent missing' })
  else if (body.tags && body.tags.length > 10) return res.status(400).json({ error: 'too many tags' })
}

module.exports = noteRouter
