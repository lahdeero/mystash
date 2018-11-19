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
  const tagi = await req.params.tag_name.toLowerCase()
  try {
    const { rows } = await db.query('SELECT muistiinpano.id,otsikko,sisalto FROM muistiinpano LEFT JOIN muistiinpanotagi ON muistiinpanotagi.muistiinpano_id = muistiinpano.id LEFT JOIN tagi ON tagi.id = muistiinpanotagi.tagi_id WHERE tagi.nimi =($1) GROUP BY muistiinpano.id,muistiinpano.otsikko,muistiinpano.sisalto', [tagi])
    await res.json(rows)
  } catch (exception) {
    await res.status(400).json(exception)
  }
})

tagRouter.post('/', async (req, res) => {
  if (req.body.nimi === undefined) return res.status(400).json({ error: 'name missing' })
  const tagi_nimi = req.body.nimi.toLowerCase()
  try {
    const { rows } = await db.query('INSERT INTO tagi(nimi) VALUES ($1) RETURNING nimi', [tagi_nimi])
    await res.json(rows)
  } catch (exception) {
    res.status(400).send('error ' + exception)
  }
})

tagRouter.post('/notetag/add', async (req, res) => {
  if (req.body.muistiinpano_id === undefined) return res.status(400).json({ error: 'note_id missing' })
  else if (req.body.tagi_id === undefined) return res.status(400).json({ error: 'tag_id missing' })

  try {
    await db.query('INSERT INTO muistiinpanotagi(muistiinpano_id, tagi_id) VALUES($1, $2)', [req.body.muistiinpano_id, req.body.tagi_id])
    await res.json([req.body.muistiinpano_id, req.body.tagi_id])
  } catch (exception) {
    await res.status(500).send(exception)
  }
})

module.exports = tagRouter
