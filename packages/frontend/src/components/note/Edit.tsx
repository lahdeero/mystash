import { useParams, useNavigate } from 'react-router-dom'

import { modifyNote } from '../../reducers/noteReducer'
import { updateEditNote } from '../../reducers/editNoteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import { useAppDispatch, useAppSelector } from '../../store'
import Container from '../common/Container'
import Input from '../common/Input'
import Button from '../common/Button'
import Chip from '../common/Chip'
import styled from 'styled-components'
import Textarea from '../common/Textarea'

const AddTagForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: 2rem 0;
`

const ChipContainer = styled.div`
  display: flex;
`

const Edit = () => {
  const dispatch = useAppDispatch()
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
    try {
      const noteObject = {
        id: editNote.id,
        title: editNote.title,
        content: editNote.content,
        tags: editNote.newTags,
      }
      await dispatch(modifyNote(noteObject))
      await dispatch(notify(`you modified '${noteObject.title}'`))
      navigate('/')
    } catch (exception) {
      console.error(exception)
      dispatch(errorMessage('ERROR WHILE EDITING NOTE'))
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
      <div>
        <h3>Note tags:</h3>
        <p>Click tag to remove</p>
      </div>
      <div>
        <div>
          <ChipContainer>
            {editNote.newTags.map((tag: any) => (
              <Chip
                key={tag}
                onClick={() => {
                  removeTag(tag)
                }}
              >
                {' '}
                {tag}{' '}
              </Chip>
            ))}
          </ChipContainer>
        </div>
      </div>
      <div>
        <AddTagForm id="tagform" onSubmit={addTag}>
          <div>
            Add tag{' '}
            <Input
              name="tagText"
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
      <h2>Edit note</h2>
      <form onSubmit={handleSubmit}>
        <div>
          Title
          <br />
          <Input
            name="title"
            value={editNote.title}
            onChange={handleFieldChange}
            type="text"
          />
        </div>
        <Textarea
          id="edit-note"
          className="note-edit"
          value={editNote.content}
          onChange={handleContent}
          minRows={10}
        />
        <br />
        <Button className="red accent-2" type="submit">
          Save
        </Button>
      </form>
    </Container>
  )
}

export default Edit
