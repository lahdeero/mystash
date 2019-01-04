const noteRouter = require('express').Router()
const client = require('../db')
// '/api/notes/directory/'

noteRouter.get('/all', async (req, res) => {
	try {
    const { rows } = await client.query('SELECT note.id, title, content, array_agg(tag.name) as tags FROM note LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id GROUP BY note.id, title, content ORDER BY note.id DESC')
  	res.json(rows)
	} catch (exception) {
		res.send(exception)
	} 
})

noteRouter.get('/search/:keyword', async (req, res) => {
	const keyword = req.params.keyword
	try {
		const { rows } = await client.query('SELECT note.id, title, content, array_agg(tag.name) as tags FROM note LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id WHERE tag.name LIKE ($1) GROUP BY note.id, title, content ORDER BY note.id DESC', [keyword])
		res.json(rows)
	} catch (exception) {
		res.send(exception)
	}
})

noteRouter.get('/note/:id', async (req, res) => {
	const id = parseInt(req.params.id)
	if (id === undefined || !Number.isInteger(id)) res.status(400).send('No id')
	const { rows } = await client.query('SELECT note.id, title, content, array_agg(tag.name) as tags FROM note LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id WHERE note.id=($1) GROUP BY note.id', [id])
  res.json(rows)
})

noteRouter.put('/note/:id', async (req, res) => {
	const id = parseInt(req.params.id)
	if (id === undefined || !Number.isInteger(id)) return res.status(400).send('No id')

	const body = req.body
	if (body.title === undefined || body.title.length === 0) return res.status(400).json({ error: 'title missing' })
	else if (body.content === undefined) return res.status(400).json({ error: 'contetent missing' })

  try {
    client.query('BEGIN')
    await client.query('UPDATE note SET title =($1), content =($2) WHERE ID =($3)', [body.title, body.content, id])

    const currentTags = await client.query('SELECT tag.name, notetag.note_id, notetag.tag_id FROM notetag LEFT JOIN tag ON tag.id = notetag.tag_id WHERE notetag.note_id = ($1)', [id])

		//Check if notetags needs to be deleted
		await currentTags.rows.forEach( async (row) => {
			if (body.tags.includes(row.name)) return
			await client.query('DELETE FROM notetag WHERE note_id = ($1) AND tag_id = ($2)', [id, row.tag_id])
		})

		//Add new notetags (and new tags if needed)
    await body.tags.forEach( async (tag) => {
      let tagId = 43 //for some reason result doesnt include added tags..
      const selectRes = await client.query('SELECT id FROM tag WHERE name = ($1)', [tag])
      if (selectRes.rows[0] === undefined) {
        const insertRes = await client.query('INSERT INTO tag(name) VALUES($1) RETURNING id', [tag])
        tagId = insertRes.rows[0].id
      } else if (selectRes.rows[0] !== undefined){
        tagId = selectRes.rows[0].id
      }
      const checkIfExists = await client.query('SELECT * FROM notetag WHERE note_id =($1) AND tag_id =($2)', [id, tagId])
      if (checkIfExists.rows[0] !== undefined) return
      const insertNoteTag = 'INSERT INTO notetag(note_id, tag_id) VALUES ($1, $2)'
      const insertNoteTagValues = [id, tagId]
      await client.query(insertNoteTag, insertNoteTagValues)
    }) 
    await client.query('COMMIT')
    /* FOR SOME REASON result DOESNT INCLUDE ADDED TAGS */
    const result = await client.query('SELECT note.id, title, content, array_agg(tag.name) as tags FROM note LEFT JOIN notetag ON notetag.note_id = note.id LEFT JOIN tag ON tag.id = notetag.tag_id WHERE note.id=($1) GROUP BY note.id', [id])
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

  if (body.title === undefined) return res.status(400).json({ error: 'title missing' })
  else if (body.content === undefined) return res.status(400).json({ error: 'contetent missing' })

  let id
  try {
    await client.query('BEGIN')
    const { rows } = await client.query('INSERT INTO note(title,content) VALUES($1, $2) RETURNING id', [body.title, body.content])
    id = rows[0].id

    await body.tags.forEach( async (tag) => {
      let tagId
      const selectRes = await client.query('SELECT id FROM tag WHERE name = ($1)', [tag])
      if (selectRes.rows[0] === undefined) {
        const insertRes = await client.query('INSERT INTO tag(name) VALUES($1) RETURNING id', [tag])
        tagId = await insertRes.rows[0].id
      } else if (selectRes.rows[0] !== undefined){
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
})

noteRouter.delete('/note/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  if (id === undefined || !Number.isInteger(id)) res.status(400).send('Id missing')

  let ret_id = 0
  try {
    await client.query('BEGIN')
    const { rows } = await client.query('SELECT * FROM note WHERE id = ($1)', [id])
    ret_id = rows[0].id
    if (rows[0] !== undefined) {
      await client.query('DELETE FROM note WHERE id = ($1)', [id])
      await client.query('COMMIT')
    }
  } catch (exception)  {
    console.log(exception)
    await client.query('ROLLBACK')
    res.status(500).json({ id: null, error: 'Could not delete note ' + id })
    throw exception
  } finally {
    console.log(ret_id)
    res.json(ret_id)
  }
})

module.exports = noteRouter
