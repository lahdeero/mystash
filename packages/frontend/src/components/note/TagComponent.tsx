import React from 'react'
import styled from 'styled-components'
import Input from '../common/Input'
import FormElement from '../common/FormElement'
import Chip from '../common/Chip'
import Button from '../common/Button'

const TagArea = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid gray;
  border-radius: 1rem;

  .new-tag-area {
    display: flex;
    width: 100%;
  }
`

const ChipContainer = styled.div`
  display: flex;
`

const TagComponent = ( { tags, setTags, notify, currentNote, updateCurrentNote, errorMessage, handleChange }) => {


  const addTag = (event) => {
    event.preventDefault()
    const maxTags = 10
    if (tags.length >= maxTags) {
      notify(`Maxium number of tags is '${maxTags}'`)
      return
    }
    if (currentNote.tagText.length === 0 || tags.includes(currentNote.tagText)) return
    try {
      const newTags = tags.concat(currentNote.tagText.split(';'))
      setTags(newTags)
      updateCurrentNote({
        tagText: ''
      })
    } catch (exception) {
      errorMessage('ERROR WHILE ADDING TAG')
    }
  }

  const removeTag = (name) => {
    setTags(tags.filter(tag => tag !== name))
  }

  return (
    <TagArea>
      <div className="new-tag-area">
        <FormElement id="tagform">
          <div>
            <br />
            <Input name='tagText' value={currentNote.tagText} onChange={handleChange} type="text" />
          </div>
        </FormElement>

        <Button type="submit" form="tagform" onClick={addTag}>Add tag</Button>
      </div>

      <ChipContainer>
        {tags.map(tag =>
          <Chip key={tag} onClick={() => { removeTag(tag) }}> {tag} </Chip>
        )}
      </ChipContainer>
    </TagArea>
  )
}

export default TagComponent
