import React, { useState } from 'react'
import { Buffer } from 'buffer'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import ReactMarkddown from 'react-markdown'
import { removeNote } from '../../reducers/noteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import styled from 'styled-components'

import Button from '../common/Button'
import Container from '../common/Container'
import Colors from '../../layout/colors'
import { useEffect } from 'react'
import fileService from '../../services/fileService'
import detectMimeType from '../../utils/detectMimeType'

const NoteContent = styled.div`
  margin: 1rem 0;
  padding: 1rem;
`

const NoteWrapper = styled.div`
  background-color: ${Colors.LightBlue};
  border-radius: 1rem;
  margin: 1rem 0;
  padding: 1rem;
`

const ContentWrapper = styled.div`
  word-break: break-all;
`

const ImageWrapper = styled.div`
  img {
    width: 100%;
    max-height: 1080px;
  }
`

const Show = ({ notes, match, history, notify, removeNote }) => {
  const note = notes.find((note) => note.id === match.params.id)
  if (!note) {
    return (<div>Could not find note</div>)
  }

  const [file1, setFile1] = useState(null)

  const fetchFile = async (fileId) => {
    const rawResponse = await fileService.getOne(fileId)
    const b64Response = Buffer.from(rawResponse, 'binary').toString('base64')
    if (detectMimeType(b64Response)) {
      setFile1(b64Response)
    }
  }

  useEffect(() => {
    if (note.files && note.files.length > 0) {
      const filteredFiles = note.files.filter(n => n) // Remove nulls
      if (filteredFiles && filteredFiles.length > 0) {
        fetchFile(filteredFiles[0])
      }
    }
  }, [])

  const deleteNote = async (event) => {
    event.preventDefault()
    if (window.confirm(`Are you sure you want to delete '${note.title}' ?`)) {
      const removedNote = await removeNote(note)
      console.log('removedNote', removedNote)
      if (removedNote.id.length > 0) {
        notify(`you deleted '${removedNote.title}'`)
        history.push('/')
      }
    }
  }

  const tags = note.tags.join()
  const text = note.content
  const markdown = tags.includes('markdown')

  const RenderContent = () => (
    <ContentWrapper>
      {text.split('\n').map(function (row, key) {
        return (
          <span key={key}>
            {row}
            <br />
          </span>
        )
      })}
    </ContentWrapper>
  )

  return (
    <Container>
      <NoteWrapper>
        <div>
          <h2>{note.title}</h2>
          <div>Updated at: {note.updatedAt}</div>
          <p>[{tags}]</p>
        </div>
        <NoteContent>
          {markdown ? <ReactMarkddown>{text}</ReactMarkddown> : <RenderContent />}
        </NoteContent>
      </NoteWrapper>
      <ImageWrapper>
        { file1 && <img src={`data:image/png;base64,${file1}`} /> }
      </ImageWrapper>
      <div className="note-action-buttons">
        <Link to={`/notes/edit/${note.id}`}>
          <Button>EDIT</Button>
        </Link>
        <Link to={`/notes/upload/${note.id}`}>
          <Button>ADD FILE</Button>
        </Link>
        <Button onClick={deleteNote} danger={true}>DELETE</Button>
      </div>
    </Container>
  )
}

const mapStateToProps = (store) => {
  return {
    notes: store.notes,
  }
}
const mapDispatchToProps = {
  removeNote,
  notify,
  errorMessage
}

const ConnectedShowNote = connect(
  mapStateToProps,
  mapDispatchToProps
)(Show)

export default ConnectedShowNote
