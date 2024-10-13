import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import Textarea from 'react-textarea-autosize'
import { connect } from 'react-redux'

import { createNote } from '../../reducers/noteReducer'
import { updateCurrentNote, clearCurrentNote } from '../../reducers/currentNoteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import Button from '../common/Button'
import Container from '../common/Container'
import Input from '../common/Input'
import { TextAreaWrapper } from '../common/TextArea'
import FormElement from '../common/FormElement'
import TagComponent from './TagComponent'


const Form = (props) => {
  const { currentNote, createNote, updateCurrentNote, clearCurrentNote, notify, errorMessage } = props
  const [tags, setTags] = useState([])

  const handleSubmit = (event) => {
    event.preventDefault()
    try {
      const noteObject = {
        title: currentNote.title,
        content: currentNote.content,
        tags: currentNote.tagText.length > 2 ? tags.concat(currentNote.tagText.split(';')) : tags
      }
      if (noteObject.tags >= 0) {
        notify('Add atleast one tag')
        return
      }
      clearCurrentNote()
      createNote(noteObject).then(() => {
        props.history.push('/')
      }, notify(`you created '${noteObject.title}'`))
    } catch (exception) {
      console.error(exception)
      errorMessage('ERROR WHILE ADDING NOTE')
    }
  }

  const handleChange = (event) => {
    updateCurrentNote({
      [event.target.name]: event.target.value
    })
  }
  const handleContent = (event) => {
    updateCurrentNote({
      content: event.target.value
    })
  }

  return (
    <Container>
      <h2>Create new note</h2>

      <FormElement id="noteform">
        <div>
          Title<br />
          <Input name='title' value={currentNote.title} onChange={handleChange} />
        </div>
        <TextAreaWrapper>
          <label>
            Content
          </label>
          <Textarea className="note-edit" value={currentNote.content} onChange={handleContent} minRows={10} />
        </TextAreaWrapper>
        <br />
      </FormElement>

      <TagComponent tags={tags} setTags={setTags} notify={notify} currentNote={currentNote} updateCurrentNote={updateCurrentNote} errorMessage={errorMessage} handleChange={handleChange} />

      <div>
        <br />
        <Button form="noteform" type="submit" onClick={handleSubmit}>Create</Button>
      </div>
    </Container>

  )
}

const mapStateToProps = (store) => {
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form))
