import { useState } from 'react'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { createNote } from '../../reducers/noteReducer'
import { updateCurrentNote, clearCurrentNote } from '../../reducers/currentNoteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import Button from '../common/Button'
import Container from '../common/Container'
import Input from '../common/Input'
import FormElement from '../common/FormElement'
import TagComponent from './TagComponent'
import Textarea from '../common/Textarea'

const Create = (props: any) => {
  const { currentNote, createNote, updateCurrentNote, clearCurrentNote, notify, errorMessage } = props
  const [tags, setTags] = useState([])
  const navigate = useNavigate()

  const handleSubmit = (event: any) => {
    event.preventDefault()
    try {
      const noteObject = {
        title: currentNote.title,
        content: currentNote.content,
        tags: currentNote.tagText.length > 2 ? tags.concat(currentNote.tagText.split(';')) : tags
      }
      if (noteObject.tags.length <= 0) {
        notify('Add atleast one tag')
        return
      }
      clearCurrentNote()
      createNote(noteObject).then(() => {
        navigate('/')
      }, notify(`you created '${noteObject.title}'`))
    } catch (exception) {
      console.error(exception)
      errorMessage('ERROR WHILE ADDING NOTE')
    }
  }

  const handleChange = (event: any) => {
    updateCurrentNote({
      [event.target.name]: event.target.value
    })
  }
  const handleContent = (event: any) => {
    updateCurrentNote({
      content: event.target.value
    })
  }
  const textAreaId = 'note-content'

  return (
    <Container>
      <h2>Create new note</h2>

      <FormElement id="noteform">
        <div>
          <Input label="Title" name='title' value={currentNote.title} onChange={handleChange} type="text" />
        </div>
          <Textarea className="note-edit" id={textAreaId} value={currentNote.content} onChange={handleContent} minRows={10} />
      </FormElement>
      <TagComponent tags={tags} setTags={setTags} notify={notify} currentNote={currentNote} updateCurrentNote={updateCurrentNote} errorMessage={errorMessage} handleChange={handleChange} />
      <div>
        <Button form="noteform" type="submit" onClick={handleSubmit}>Create</Button>
      </div>
    </Container>

  )
}

const mapStateToProps = (store: any) => {
  return {
    currentNote: store.currentNote,
  }
}
const mapDispatchToProps = {
  updateCurrentNote,
  clearCurrentNote,
  createNote,
  notify,
  errorMessage,
}

export default connect(mapStateToProps, mapDispatchToProps)(Create)
