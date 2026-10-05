import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { modifyNote } from '../../reducers/noteReducer'
import { updateEditNote } from '../../reducers/editNoteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import { useAppDispatch, useAppSelector } from '../../store'
import Container from '../common/Container'
import Input from '../common/Input'
import Button from '../common/Button'
import styled from 'styled-components'
import Textarea from '../common/Textarea'
import ChipGroup from '../common/ChipGroup'



const AddTagForm = styled.form`
  display: flex;
  flex-direction: column;
`

const EditNoteForm = styled.form`
  display: flex;
  flex-direction: column;
`

const Edit = () => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const notes = useAppSelector((state) => state.notes)
  const editNote = useAppSelector((state) => state.editNote)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const note = notes.find((note: any) => note.id === id)
  if (!editNote?.id || editNote.id !== note.id) {
    dispatch(updateEditNote({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags.filter((tag: any) => tag !== null),
      newTags: note.tags.filter((tag: any) => tag !== null),
      tagText: '',
    }))
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const noteObject = {
        id: editNote.id,
        title: editNote.title,
        content: editNote.content,
        tags: editNote.newTags,
      }
      await dispatch(modifyNote(noteObject))
      dispatch(notify(`you modified '${noteObject.title}'`))
      navigate('/')
    } catch (exception) {
      console.error(exception)
      dispatch(errorMessage('ERROR WHILE EDITING NOTE'))
    } finally {
      setLoading(false)
    }
  }

  const handleTagTextChange = (event: any) => {
    dispatch(updateEditNote({
      tagText: event.target.value,
    }))
  }

  const handleFieldChange = (event: any) => {
    dispatch(updateEditNote({
      title: event.target.value,
    }))
  }

  const handleContent = (event: any) => {
    dispatch(updateEditNote({
      content: event.target.value,
    }))
  }

  const addTag = async (event: any) => {
    event.preventDefault()
    const maxTags = 10
    if (
      editNote.tagText.length === 0 ||
      editNote.newTags.includes(editNote.tagText)
    ) {
      return
    }

    let tagTemp = [...editNote.newTags]
    tagTemp.push(editNote.tagText)

    if (tagTemp.length < maxTags) {
      dispatch(updateEditNote({
        newTags: tagTemp,
        tagText: '',
      }))
    } else {
      dispatch(notify(`Maxium number of tags is '${maxTags}'`))
    }
  }

  const removeTag = (tagName: any) => {
    dispatch(updateEditNote({
      newTags: editNote.newTags.filter((tag: any) => tag !== tagName),
    }))
  }

  return (
    <Container>
      <h2>Edit note</h2>
      <ChipGroup label="Tags" items={editNote.newTags} onClick={removeTag} />
      <div>
        <AddTagForm id="tagform" onSubmit={addTag}>
          <div>
            <Input
              name="tagText"
              label="Add tags"
              value={editNote.tagText}
              onChange={handleTagTextChange}
              type="text"
            />
          </div>
          <Button className="deep orange" type="submit" form="tagform">
            Add tag
          </Button>
        </AddTagForm>
      </div>
      <EditNoteForm onSubmit={handleSubmit}>
        <div>
          <Input
            name="title"
            label="Title"
            value={editNote.title}
            onChange={handleFieldChange}
            type="text"
          />
        </div>
        <Textarea
          id="edit-note"
          className="note-edit"
          label="Content"
          value={editNote.content}
          onChange={handleContent}
          minRows={10}
        />
        <br />
        <Button className="red accent-2" type="submit" loading={loading}>
          Save
        </Button>
      </EditNoteForm>
    </Container >
  )
}

export default Edit
