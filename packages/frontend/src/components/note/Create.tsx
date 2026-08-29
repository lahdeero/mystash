import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createNote } from '../../reducers/noteReducer'
import { updateCurrentNote, clearCurrentNote } from '../../reducers/currentNoteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import { useAppDispatch, useAppSelector } from '../../store'
import Button from '../common/Button'
import Container from '../common/Container'
import Input from '../common/Input'
import FormElement from '../common/FormElement'
import TagComponent from './TagComponent'
import Textarea from '../common/Textarea'

const Create = () => {
  const dispatch = useAppDispatch()
  const currentNote = useAppSelector((state) => state.currentNote)
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
        dispatch(notify('Add atleast one tag'))
        return
      }
      dispatch(clearCurrentNote())
      dispatch(createNote(noteObject)).then(() => {
        navigate('/')
      })
      dispatch(notify(`you created '${noteObject.title}'`))
    } catch (exception) {
      console.error(exception)
      dispatch(errorMessage('ERROR WHILE ADDING NOTE'))
    }
  }

  const handleChange = (event: any) => {
    dispatch(updateCurrentNote({
      [event.target.name]: event.target.value
    }))
  }
  const handleContent = (event: any) => {
    dispatch(updateCurrentNote({
      content: event.target.value
    }))
  }
  const textAreaId = 'note-content'

  const notifyMessage = (message: string) => dispatch(notify(message))
  const updateCurrent = (current: any) => dispatch(updateCurrentNote(current))
  const errorMsg = (message: string) => dispatch(errorMessage(message))

  return (
    <Container>
      <h2>Create new note</h2>

      <FormElement id="noteform">
        <div>
          <Input label="Title" name='title' value={currentNote.title} onChange={handleChange} type="text" />
        </div>
          <Textarea className="note-edit" id={textAreaId} value={currentNote.content} onChange={handleContent} minRows={10} />
      </FormElement>
      <TagComponent tags={tags} setTags={setTags} notify={notifyMessage} currentNote={currentNote} updateCurrentNote={updateCurrent} errorMessage={errorMsg} handleChange={handleChange} />
      <div>
        <Button form="noteform" type="submit" onClick={handleSubmit}>Create</Button>
      </div>
    </Container>

  )
}

export default Create
