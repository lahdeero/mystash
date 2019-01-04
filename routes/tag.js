const tagRouter = require('express').Router()
const db = require('../db')

tagRouter.get('/all', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT nimi FROM Tagi')
    await res.json(rows)
  } catch (exception) {
    res.send(exception)
  }
})

tagRouter.get('/directory/:tag_name', async (req, res) => {
  const tag = await req.params.tag_name.toLowerCase()
  try {
    const { rows } = await db.query('SELECT note.id,title,content FROM note LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id WHERE tag.name =($1) GROUP BY note.id,note.title,note.content', [tag])
    await res.json(rows)
  } catch (exception) {
    await res.status(400).json(exception)
  }
})

tagRouter.post('/', async (req, res) => {
  if (req.body.nimi === undefined) return res.status(400).json({ error: 'name missing' })
  const tag_name = req.body.nimi.toLowerCase()
  try {
    const { rows } = await db.query('INSERT INTO tag(name) VALUES ($1) RETURNING name', [tag_name])
    await res.json(rows)
  } catch (exception) {
    res.status(400).send('error ' + exception)
  }
})

tagRouter.post('/notetag/add', async (req, res) => {
  if (req.body.note_id === undefined) return res.status(400).json({ error: 'note_id missing' })
  else if (req.body.tag_id === undefined) return res.status(400).json({ error: 'tag_id missing' })

  try {
    await db.query('INSERT INTO notetag(note_id, tag_id) VALUES($1, $2)', [req.body.note_id, req.body.tag_id])
    await res.json([req.body.muistiinpano_id, req.body.tag_id])
  } catch (exception) {
    await res.status(500).send(exception)
  }
})

module.exports = tagRouter
