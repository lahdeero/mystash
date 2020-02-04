const noteRouter = require('express').Router()
const client = require('../db')
const verifyJWT = require('../middlewares/verifyJWT')

noteRouter.all('*', verifyJWT.verifyJWT_MW)

noteRouter.get('/all', async (req, res) => {
  const user = req.user
  try {
    const { rows } = await client.query('SELECT note.id, title, content, modified_date, array_agg(tag.name) as tags FROM note  \
    LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id \
    LEFT JOIN account ON account.id = note.account_id WHERE account.id = ($1) \
    GROUP BY note.id ORDER BY modified_date DESC NULLS LAST', [user.id])
    res.send(rows)
  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'could not get notes' })
  }
})

noteRouter.get('/note/:id', async (req, res) => {
  const user = req.user
  const noteId = parseInt(req.params.id)
  try {
    const { rows } = await client.query('SELECT note.id, title, content, modified_date, array_agg(tag.name) as tags FROM note \
    LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id \
    WHERE note.id=($1) AND account_id = ($2) GROUP BY note.id', [noteId, user.id])
    res.send(rows[0])
  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'failed to get note!' })
  }
})

resolveTagId = async (tag) => {
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

  if (body.title === undefined) return res.status(400).json({ error: 'title missing' })
  else if (body.content === undefined) return res.status(400).json({ error: 'contetent missing' })

  try {
    await client.query('BEGIN')
    const { rows } = await client.query('INSERT INTO note(title,content,account_id,modified_date,created_date) VALUES($1, $2, $3, NOW(),NOW()) RETURNING id', [body.title, body.content, user.id])
    const noteId = rows[0].id

    const tags = body.tags.length === 0 ? ['undefined'] : body.tags
    await tags.forEach(async (tag) => {
      const tagId = await resolveTagId(tag)
      const insertNoteTag = await 'INSERT INTO notetag(note_id, tag_id) VALUES ($1, $2)'
      const insertNoteTagValues = [noteId, tagId]
      await client.query(insertNoteTag, insertNoteTagValues)
    })
    await client.query('COMMIT')
    const result = await client.query('SELECT note.id, title, content, modified_date, array_agg(tag.name) as tags FROM note \
    LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id \
    WHERE note.id=($1) AND account_id = ($2) GROUP BY note.id', [noteId, user.id])
    res.json(result.rows[0])
  } catch (exception) {
    await client.query('ROLLBACK')
    console.log(exception)
    res.status(400).send('Could not add note! ' + exception)
  }
})

noteRouter.put('/note/:id', async (req, res) => {
  const user = req.user
  const noteId = parseInt(req.params.id)
  if (noteId === undefined || !Number.isInteger(noteId)) return res.status(400).send('No id')

  const body = req.body
  if (body.title === undefined || body.title.length === 0) return res.status(400).json({ error: 'title missing' })
  else if (body.content === undefined) return res.status(400).json({ error: 'contetent missing' })
  try {
    client.query('BEGIN')
    await client.query('UPDATE note SET title =($1), content =($2), modified_date=NOW() WHERE note.id =($3) AND account_id =($4)', [body.title, body.content, noteId, user.id])

    const currentTags = await client.query('SELECT tag.name, notetag.note_id, notetag.tag_id FROM notetag LEFT JOIN tag ON tag.id = notetag.tag_id WHERE notetag.note_id = ($1)', [noteId])

    // Check if notetags needs to be deleted
    currentTags.rows.forEach(async (row) => {
      if (body.tags.includes(row.name)) return
      await client.query('DELETE FROM notetag WHERE note_id = ($1) AND tag_id = ($2)', [noteId, row.tag_id])
    })

    // Add new notetags (and new tags if needed)
    await body.tags.map(async (tag) => {
      const tagRow = await client.query('SELECT id FROM tag WHERE name = ($1)', [tag])
      // console.log('tagRow.rows', tagRow.rows)
      // console.log('len', tagRow.rows.length)

      const tagId = (tagRow.rows && tagRow.rows.length > 0 && tagRow.rows[0].id)
        ? tagRow.rows[0].id : await client.query('INSERT INTO tag(name) VALUES($1) RETURNING id', [tag]).rows[0].id

      const noteTagExists = await client.query('SELECT * FROM notetag WHERE note_id =($1) AND tag_id =($2)', [noteId, tagId])

      // console.log('tag: ', tag)
      // console.log('notetagExists: ', noteTagExists)

      if (!noteTagExists.rows[0]) {
        const insertNoteTag = 'INSERT INTO notetag(note_id, tag_id) VALUES ($1, $2)'
        const insertNoteTagValues = [noteId, tagId]
        await client.query(insertNoteTag, insertNoteTagValues)
      }
    })
    await client.query('COMMIT')
    /* FOR UNKNOWN REASON result DOESNT INCLUDE ADDED TAGS */
    // const result = await client.query('SELECT note.id, title, content, modified_date, array_agg(tag.name) as tags FROM note \
    // LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id WHERE note.id=($1) GROUP BY note.id', [id])
    const { rows } = await client.query('SELECT note.id, title, content, modified_date, array_agg(tag.name) as tags FROM note \
    LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id \
    WHERE note.id=($1) AND account_id = ($2) GROUP BY note.id', [noteId, user.id])
    console.log('result rows[0]: ', rows[0])
    return res.json(rows[0])
  } catch (error) {
    client.query('ROLLBACK')
    console.log(error)
    return res.status(400).send('Could not update note' + error)
  }
})

noteRouter.delete('/note/:id', async (req, res) => {
  const user = req.user
  const noteId = parseInt(req.params.id)
  if (noteId === undefined || !Number.isInteger(noteId)) return res.status(400).json('Id missing')

  try {
    await client.query('DELETE FROM note WHERE id = ($1) AND account_id = ($2)', [noteId, user.id])
    return res.status(200).json(noteId)
  } catch (exception) {
    await client.query('ROLLBACK')
    return res.status(500).json({ error: 'Could not delete note ' + noteId })
  }
})

module.exports = noteRouter
