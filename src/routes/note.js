const jwt = require('jsonwebtoken')
const noteRouter = require('express').Router()
const client = require('../db')

// '/api/notes/directory/'

const getTokenFrom = (request) => {
  const authorization = request.get('Authorization')
  console.log('authorization = ', authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  console.log('return null')
  return null
}

noteRouter.get('/all/public', async (req, res) => {
  try {
    const { rows } = await client.query('SELECT note.id FROM note')
    res.json(rows)
  } catch (exception) {
    res.send(exception)
  }
})

noteRouter.get('/all', async (req, res) => {
  console.log('eka')
  try {
    console.log('toka')
    const token = getTokenFrom(req)
    console.log('kolmas')
    console.log('token = ', token)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    console.log('neljas')

    if (!token || !decodedToken.id) {
      console.log('token juttui')
      return res.status(401).json({ errro: 'token invalid or missing' })
    }
    console.log('ei oo token juttui')
    const { rows } = await client.query('SELECT note.id,title,content,array_agg(tag.name) as tags FROM note LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id LEFT JOIN account ON account.id = note.account_id WHERE account.id = ($1) GROUP BY note.id ORDER BY note.id DESC', [decodedToken.id])
    res.send(rows)
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      res.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

noteRouter.get('/note/:id', async (req, res) => {
  const noteid = parseInt(req.params.id)
  try {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return res.status(401).json({ errro: 'token invalid or missing' })
    }
    const { rows } = await client.query('SELECT note.id, title, content, array_agg(tag.name) as tags FROM note LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id WHERE note.id=($1) AND account_id = ($2) GROUP BY note.id', [noteid, decodedToken.id])
    res.send(rows)
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      res.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

noteRouter.post('/', async (req, res) => {
  const body = req.body

  if (body.title === undefined) return res.status(400).json({ error: 'title missing' })
  else if (body.content === undefined) return res.status(400).json({ error: 'contetent missing' })

  try {
    const token = await getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    const accId = decodedToken.id

    if (!token || !decodedToken.id) {
      return res.status(401).json({ errro: 'token invalid or missing' })
    }
    let id
    try {
      await client.query('BEGIN')
      const { rows } = await client.query('INSERT INTO note(title,content,account_id) VALUES($1, $2, $3) RETURNING id', [body.title, body.content, accId])
      id = await rows[0].id

      const tags = body.tags.length === 0 ? ['undefined'] : body.tags
      await tags.forEach(async (tag) => {
        let tagId
        const selectRes = await client.query('SELECT id FROM tag WHERE name = ($1)', [tag])
        if (selectRes.rows[0] === undefined) {
          const insertRes = await client.query('INSERT INTO tag(name) VALUES($1) RETURNING id', [tag])
          tagId = await insertRes.rows[0].id
        } else if (selectRes.rows[0] !== undefined) {
          tagId = await selectRes.rows[0].id
        }

        const insertNoteTag = await 'INSERT INTO notetag(note_id, tag_id) VALUES ($1, $2)'
        const insertNoteTagValues = await [id, tagId]
        await client.query(insertNoteTag, insertNoteTagValues)
      })

      await client.query('COMMIT')
      const result = await client.query('SELECT note.id, title, content, array_agg(tag.name) as tags FROM note LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id WHERE note.id=($1) GROUP BY note.id', [id])
      await res.json(result.rows)
    } catch (exception) {
      await client.query('ROLLBACK')
      console.log(exception)
      res.status(400).send('Could not add note! ' + exception)
    }
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      return res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

noteRouter.put('/note/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  if (id === undefined || !Number.isInteger(id)) return res.status(400).send('No id')

  const body = req.body
  if (body.title === undefined || body.title.length === 0) return res.status(400).json({ error: 'title missing' })
  else if (body.content === undefined) return res.status(400).json({ error: 'contetent missing' })
  try {
    const token = await getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    const accId = decodedToken.id

    if (!token || !decodedToken.id) {
      return res.status(401).json({ errro: 'token invalid or missing' })
    }
    try {
      client.query('BEGIN')
      await client.query('UPDATE note SET title =($1), content =($2) WHERE note.id =($3) AND account_id =($4)', [body.title, body.content, id, accId])

      const currentTags = await client.query('SELECT tag.name, notetag.note_id, notetag.tag_id FROM notetag LEFT JOIN tag ON tag.id = notetag.tag_id WHERE notetag.note_id = ($1)', [id])

      // Check if notetags needs to be deleted
      await currentTags.rows.forEach(async (row) => {
        if (body.tags.includes(row.name)) return
        await client.query('DELETE FROM notetag WHERE note_id = ($1) AND tag_id = ($2)', [id, row.tag_id])
      })

      // Add new notetags (and new tags if needed)
      await body.tags.forEach(async (tag) => {
        let tagId = 43 // for some reason result doesnt include added tags..
        const selectRes = await client.query('SELECT id FROM tag WHERE name = ($1)', [tag])
        if (selectRes.rows[0] === undefined) {
          const insertRes = await client.query('INSERT INTO tag(name) VALUES($1) RETURNING id', [tag])
          tagId = insertRes.rows[0].id
        } else if (selectRes.rows[0] !== undefined) {
          tagId = selectRes.rows[0].id
        }
        const checkIfExists = await client.query('SELECT * FROM notetag WHERE note_id =($1) AND tag_id =($2)', [id, tagId])
        if (checkIfExists.rows[0] !== undefined) return
        const insertNoteTag = 'INSERT INTO notetag(note_id, tag_id) VALUES ($1, $2)'
        const insertNoteTagValues = [id, tagId]
        await client.query(insertNoteTag, insertNoteTagValues)
      })
      await client.query('COMMIT')
      /* FOR UNKNOWN REASON result DOESNT INCLUDE ADDED TAGS */
      const result = await client.query('SELECT note.id, title, content, array_agg(tag.name) as tags FROM note LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id WHERE note.id=($1) GROUP BY note.id', [id])
      return await res.json(result.rows)
    } catch (error) {
      client.query('ROLLBACK')
      console.log(error)
      return res.status(400).send('Could not update note' + error)
    }
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      res.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      return res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

noteRouter.delete('/note/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  if (id === undefined || !Number.isInteger(id)) return res.status(400).send('Id missing')

  try {
    const token = await getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    const accId = decodedToken.id

    if (!token || !decodedToken.id) {
      return res.status(401).json({ errro: 'token invalid or missing' })
    }
    await client.query('BEGIN')
    const { rows } = await client.query('SELECT * FROM note WHERE id = ($1) AND account_id = ($2)', [id, accId])
    if (rows[0] !== undefined) {
      await client.query('DELETE FROM note WHERE id = ($1)', [id])
      await client.query('COMMIT')
    }
    return res.json(rows[0].id)
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      res.status(401).json({ error: exception.message })
    } else {
      await client.query('ROLLBACK')
      res.status(500).json({ id: null, error: 'Could not delete note ' + id })
      console.log(exception)
      return res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

module.exports = noteRouter
