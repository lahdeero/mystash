import React from 'react'
import { Link } from 'react-router-dom'
import Chip from '../common/Chip'
import ContentSpan from '../common/ContentSpan'
import styled from 'styled-components'

const NoteWrapper = styled.div`
  border: 1px solid gray;
  margin: 1rem 0;
  padding: 1rem;
`

const TitleRow = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  * {
    box-sizing: border-box;
  }

  > a {
    padding: .2rem 1.5rem 0 0;
    overflow: hidden;
    text-overflow: ellipse;
  }

  > div {
  }
`

const TagWrapper = styled.div`
  display: flex;
`

const ListNote = ({ note, filter }) => {
  if (!note || !note.id) return <div />

  const handleClick = (tagi) => {
    filter.setFilter(tagi.tag)
  }

  const tags = note.tags || ['EI TAGIA', 'HUOM']
  const text = note.content.length <= 150 ? note.content : `${note.content.substring(0, 150)}...`

  return (
    <NoteWrapper>
      <TitleRow>
        <Link to={`/notes/${note.id}`}>
          <ContentSpan>{note.title} </ContentSpan>
        </Link>
        <TagWrapper>
          {tags.join(',').split(',').map(tag =>
            <Chip key={`tag-${tag}-${Math.floor(Math.random() * 1000)}`} onClick={() => { handleClick({ tag }) }}> {tag} </Chip>)}
        </TagWrapper>
      </TitleRow>
      <div>
        {text.split('\n').map(function (row, key) {
          return (
            <ContentSpan key={key}>{row}</ContentSpan>
          )
        })}
      </div>
    </NoteWrapper>
  )
}

export default ListNote
