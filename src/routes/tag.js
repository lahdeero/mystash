const tagRouter = require('express').Router()
const pool = require('../db')

tagRouter.get('/all', async (req, res) => {

  const client = pool.connect()
  try {
    const { rows } = await client.query('SELECT nimi FROM Tagi')
    res.json(rows)
  } catch (exception) {
    res.send(exception)
  } finally {
    client.release()
  }
})

tagRouter.get('/directory/:tag_name', async (req, res) => {
  const tag = req.params.tag_name.toLowerCase()
  const client = pool.connect()
  try {
    const { rows } = await client.query('SELECT note.id,title,content FROM note LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id WHERE tag.name =($1) GROUP BY note.id,note.title,note.content', [tag])
    res.json(rows)
  } catch (exception) {
    res.status(400).json(exception)
  } finally {
    client.release()
  }
})

tagRouter.post('/', async (req, res) => {
  if (req.body.nimi === undefined) return res.status(400).json({ error: 'name missing' })
  const tagName = req.body.nimi.toLowerCase()
  const client = pool.connect()
  try {
    const { rows } = await client.query('INSERT INTO tag(name) VALUES ($1) RETURNING name', [tagName])
    res.json(rows)
  } catch (exception) {
    res.status(400).send('error ' + exception)
  } finally {
    client.release()
  }
})

tagRouter.post('/notetag/add', async (req, res) => {
  if (req.body.note_id === undefined) return res.status(400).json({ error: 'note_id missing' })
  else if (req.body.tag_id === undefined) return res.status(400).json({ error: 'tag_id missing' })

  const client = pool.connect()
  try {
    await client.query('INSERT INTO notetag(note_id, tag_id) VALUES($1, $2)', [req.body.note_id, req.body.tag_id])
    res.json([req.body.muistiinpano_id, req.body.tag_id])
  } catch (exception) {
    res.status(500).send(exception)
  } finally {
    client.release()
  }
})

module.exports = tagRouter
