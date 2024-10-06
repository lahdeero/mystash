import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import Textarea from 'react-textarea-autosize'
import { connect } from 'react-redux'

import { modifyNote } from '../../reducers/noteReducer'
import { updateEditNote, clearEditNote } from '../../reducers/editNoteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import Container from '../common/Container'
import Input from '../common/Input'
import Button from '../common/Button'
import Chip from '../common/Chip'
import { TextAreaWrapper } from '../common/TextArea'
import styled from 'styled-components'

const AddTagForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: 2rem 0;
`

const ChipContainer = styled.div`
  display: flex;
`

const Edit = ( { notes, match, errorMessage, history, modifyNote, notify, editNote, updateEditNote }) => {
  const note = notes.find(({ id }) => id === match.params.id)

  useEffect(() => {
    if (editNote.id === note.id) {
      return
    }

    updateEditNote({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags.filter(tag => tag !== null),
      newTags: note.tags.filter(tag => tag !== null),
      tagText: ''
    })
  }, [note, editNote.id, updateEditNote])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const noteObject = {
        id: editNote.id,
        title: editNote.title,
        content: editNote.content,
        tags: editNote.newTags
      }
      await modifyNote(noteObject)
      await notify(`you modified '${noteObject.title}'`)
      history.push('/')
    } catch (exception) {
      console.error(exception)
      errorMessage('ERROR WHILE EDITING NOTE')
    }
  }

  const handleTagTextChange = (event) => {
    updateEditNote({
      tagText: event.target.value
    })
  }

  const handleFieldChange = (event) => {
    updateEditNote({
      title: event.target.value
    })
  }

  const handleContent = (event) => {
    updateEditNote({
      content: event.target.value
    })
  }

  const addTag = async (event) => {
    event.preventDefault()
    const maxTags = 10
    if (editNote.tagText.length === 0 || editNote.newTags.includes(editNote.tagText)) {
      return
    }

    let tagTemp = [...editNote.newTags]
    tagTemp.push(editNote.tagText)

    if (tagTemp.length < maxTags) {
      updateEditNote({
        newTags: tagTemp,
        tagText: ''
      })
    } else {
      notify(`Maxium number of tags is '${maxTags}'`)
    }
  }

  const removeTag = (tagName) => {
    updateEditNote({
      newTags: editNote.newTags.filter(tag => tag !== tagName)
    })
  }

  return (
    <Container>
      <div>
        <h3>Note tags:</h3>
        <p>Click tag to remove</p>
      </div>
      <div>
        <div>
          <ChipContainer>
            {editNote.newTags.map(tag =>
              <Chip key={tag} onClick={() => { removeTag(tag) }}> {tag} </Chip>
            )}
          </ChipContainer>
        </div>
      </div>
      <div>
        <AddTagForm id="tagform" onSubmit={addTag}>
          <div>
            Add tag <Input name="tagText" value={editNote.tagText} onChange={handleTagTextChange} />
          </div>
          <Button className="deep orange" type="submit" form="tagform">Add tag</Button>
        </AddTagForm>
      </div>
      <h2>Edit note</h2>
      <form onSubmit={handleSubmit}>
        <div>
          Title<br />
          <Input name="title" value={editNote.title} onChange={handleFieldChange} />
        </div>
        <TextAreaWrapper>
          <label>
            Content
          </label>
          <Textarea className="note-edit" value={editNote.content} onChange={handleContent} minRows={10} />
        </TextAreaWrapper>
        <br />
        <Button waves="light" className="red accent-2" type="submit">Save</Button>
      </form>
    </Container>
  )
}

const mapStateToProps = (store) => {
  return {
    notes: store.notes,
    editNote: store.editNote,
  }
}
const mapDispatchToProps = {
  updateEditNote,
  clearEditNote,
  modifyNote,
  notify,
  errorMessage
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(Edit))
