const noteRouter = require('express').Router()
const client = require('../db')

noteRouter.get('/all', async (req, res) => {
	try {
		const { rows } = await client.query('SELECT muistiinpano.id, otsikko, sisalto, array_agg(tagi.nimi) as tagit FROM muistiinpano LEFT JOIN muistiinpanotagi ON muistiinpanotagi.muistiinpano_id = muistiinpano.id LEFT JOIN tagi ON tagi.id = muistiinpanotagi.tagi_id GROUP BY muistiinpano.id, otsikko, sisalto ORDER BY muistiinpano.id DESC')
  	res.json(rows)
	} catch (exception) {
		res.send(exception)
	} 
})

noteRouter.get('/note/:id', async (req, res) => {
	const id = parseInt(req.params.id)
	if (id === undefined || !Number.isInteger(id)) res.status(400).send('No id')
	const { rows } = await client.query('SELECT muistiinpano.id, otsikko, sisalto, array_agg(tagi.nimi) as tagit FROM muistiinpano LEFT JOIN muistiinpanotagi ON muistiinpanotagi.muistiinpano_id = muistiinpano.id LEFT JOIN tagi ON tagi.id = muistiinpanotagi.tagi_id WHERE muistiinpano.id=($1) GROUP BY muistiinpano.id', [id])
  res.json(rows)
})

noteRouter.put('/note/:id', async (req, res) => {
	const id = parseInt(req.params.id)
	if (id === undefined || !Number.isInteger(id)) return res.status(400).send('No id')

	const body = req.body
	if (body.otsikko === undefined || body.otsikko.length === 0) return res.status(400).json({ error: 'title missing' })
	else if (body.sisalto === undefined) return res.status(400).json({ error: 'contetent missing' })

  try {
    client.query('BEGIN')
    await client.query('UPDATE muistiinpano SET otsikko =($1), sisalto =($2) WHERE ID =($3)', [body.otsikko, body.sisalto, id])

    const currentTags = await client.query('SELECT tagi.nimi, muistiinpanotagi.muistiinpano_id, muistiinpanotagi.tagi_id FROM muistiinpanotagi LEFT JOIN tagi ON tagi.id = muistiinpanotagi.tagi_id WHERE muistiinpanotagi.muistiinpano_id = ($1)', [id])

		//Check if notetags needs to be deleted
		await currentTags.rows.forEach( async (rivi) => {
			if (body.tagit.includes(rivi.nimi)) return
			await client.query('DELETE FROM muistiinpanotagi WHERE muistiinpano_id = ($1) AND tagi_id = ($2)', [id, rivi.tagi_id])
		})

		//Add new notetags (and new tags if needed)
    await body.tagit.forEach( async (tagi) => {
      let tagId = 43 //for some reason result doesnt include added tags..
      const selectRes = await client.query('SELECT id FROM tagi WHERE nimi = ($1)', [tagi])
      if (selectRes.rows[0] === undefined) {
        const insertRes = await client.query('INSERT INTO tagi(nimi) VALUES($1) RETURNING id', [tagi])
        tagId = insertRes.rows[0].id
      } else if (selectRes.rows[0] !== undefined){
        tagId = selectRes.rows[0].id
      }
      const checkIfExists = await client.query('SELECT * FROM muistiinpanotagi WHERE muistiinpano_id =($1) AND tagi_id =($2)', [id, tagId])
      if (checkIfExists.rows[0] !== undefined) return
      const insertNoteTag = 'INSERT INTO muistiinpanotagi(muistiinpano_id, tagi_id) VALUES ($1, $2)'
      const insertNoteTagValues = [id, tagId]
      await client.query(insertNoteTag, insertNoteTagValues)
    }) 
    await client.query('COMMIT')
    /* FOR SOME REASON result DOESNT INCLUDE ADDED TAGS */
    const result = await client.query('SELECT muistiinpano.id, otsikko, sisalto, array_agg(tagi.nimi) as tagit FROM muistiinpano LEFT JOIN muistiinpanotagi ON muistiinpanotagi.muistiinpano_id = muistiinpano.id LEFT JOIN tagi ON tagi.id = muistiinpanotagi.tagi_id WHERE muistiinpano.id=($1) GROUP BY muistiinpano.id', [id])
    await res.json(result.rows)
  } catch (error) {
    client.query('ROLLBACK')
    console.log(error)
    res.status(400).send('Could not update note' + error)
  } finally {
  }
})

noteRouter.post('/', async (req, res) => {
  const body = req.body

  if (body.otsikko === undefined) return res.status(400).json({ error: 'title missing' })
  else if (body.sisalto === undefined) return res.status(400).json({ error: 'contetent missing' })

  let id
  try {
    await client.query('BEGIN')
    const { rows } = await client.query('INSERT INTO muistiinpano(otsikko,sisalto) VALUES($1, $2) RETURNING id', [body.otsikko, body.sisalto])
    id = rows[0].id

    await body.tagit.forEach( async (tagi) => {
      let tagId
      const selectRes = await client.query('SELECT id FROM tagi WHERE nimi = ($1)', [tagi])
      if (selectRes.rows[0] === undefined) {
        const insertRes = await client.query('INSERT INTO tagi(nimi) VALUES($1) RETURNING id', [tagi])
        tagId = await insertRes.rows[0].id
      } else if (selectRes.rows[0] !== undefined){
        tagId = await selectRes.rows[0].id
      }

      const insertNoteTag = await 'INSERT INTO muistiinpanotagi(muistiinpano_id, tagi_id) VALUES ($1, $2)'
      const insertNoteTagValues = await [id, tagId]
      await client.query(insertNoteTag, insertNoteTagValues)
    })
    
    await client.query('COMMIT')
    const result = await client.query('SELECT muistiinpano.id, otsikko, sisalto, array_agg(tagi.nimi) as tagit FROM muistiinpano LEFT JOIN muistiinpanotagi ON muistiinpanotagi.muistiinpano_id = muistiinpano.id LEFT JOIN tagi ON tagi.id = muistiinpanotagi.tagi_id WHERE muistiinpano.id=($1) GROUP BY muistiinpano.id', [id])
    await res.json(result.rows)
  } catch (exception) {
    await client.query('ROLLBACK')
    console.log(exception)
    res.status(400).send('Coult not add note! ' + exception)
  }
})

noteRouter.delete('/note/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  if (id === undefined || !Number.isInteger(id)) res.status(400).send('Id missing')

  let message = ''
  try {
    await client.query('BEGIN')
    const { rows } = await client.query('SELECT * FROM muistiinpano WHERE id = ($1)', [id])
    if (rows[0] !== undefined) {
      message = await 'Note ' + rows[0].id + ' deleted! title: ' + rows[0].otsikko + ' content: ' + rows[0].sisalto
      await client.query('DELETE FROM muistiinpano WHERE id = ($1)', [id])
      await client.query('COMMIT')
    }
  } catch (exception)  {
    console.log(exception)
    await client.query('ROLLBACK')
    res.status(500).json({ error: 'something went wrong' })
    throw exception
  } finally {
    console.log(message)
  }
  if (message === '' || message === undefined) res.json('Note already deleted(?)')
  else res.json(message)
})

module.exports = noteRouter
