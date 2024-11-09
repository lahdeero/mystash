import React, { useState } from 'react'
import { Buffer } from 'buffer'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import ReactMarkddown from 'react-markdown'
import styled from 'styled-components'
import { ClipLoader } from 'react-spinners'

import { removeNote } from '../../reducers/noteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import Button from '../common/Button'
import Container from '../common/Container'
import Colors from '../../layout/colors'
import { useEffect } from 'react'
import fileService from '../../services/fileService'

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif']

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

const FilesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: flex-start;
  padding: 1rem;
`

const ImagesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: flex-start;
  padding: 1rem;
`

const DataFilesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: flex-start;
  padding: 1rem;
}
`

const ImagePreview = styled.div`
  img {
    max-width: 320px;
    max-height: 240px;
  }
`

const Show = ({ notes, match, history, notify, removeNote }) => {
  const note = notes.find((note) => note.id === match.params.id)
  if (!note) {
    return <div>Could not find note</div>
  }

  const [dataFilesInfo, setDataFilesInfo] = useState([])
  const [imagesInfo, setImagesInfo] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const scanFiles = async (noteId) => {
    setLoading(true)
    try {
      const rawResponse = await fileService.scanFiles(noteId)
      const images = rawResponse.filter((file) =>
        IMAGE_MIME_TYPES.includes(file.mimeType)
      )
      const dataFiles = rawResponse.filter(
        (file) => !IMAGE_MIME_TYPES.includes(file.mimeType)
      )
      setImagesInfo(images)
      setDataFilesInfo(dataFiles)
    } catch (e) {
      console.error(e)
      notify('Could not scan files')
    }
    setLoading(false)
  }

  const fetchFile = async (fileId) => {
    setLoading(true)
    const rawResponse = await fileService.getOne(fileId)
    const b64Response = Buffer.from(rawResponse, 'binary').toString('base64')
    setLoading(false)
    return b64Response
  }

  useEffect(() => {
    scanFiles(note.id)
  }, [note.id])

  useEffect(() => {
    imagesInfo.forEach(async (image) => {
      const b64Response = await fetchFile(image.id)
      const img = document.createElement('img')
      img.id = image.id
      img.src = `data:${image.mimeType};base64,${b64Response}`
      img.alt = image.title ?? image.fileName
      const uniqueImages = [...images, img].filter(
        (image, index, self) =>
          index === self.findIndex((img) => img.id === image.id)
      )
      setImages(uniqueImages)
    })
  }, [imagesInfo])

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

  console.log('imagesInfo', imagesInfo)

  return (
    <Container>
      <NoteWrapper>
        <div>
          <h2>{note.title}</h2>
          <div>Updated at: {note.updatedAt}</div>
          <p>[{tags}]</p>
        </div>
        <NoteContent>
          {markdown ? (
            <ReactMarkddown>{text}</ReactMarkddown>
          ) : (
            <RenderContent />
          )}
        </NoteContent>
      </NoteWrapper>
      <FilesWrapper>
        <ClipLoader loading={loading} color="blue" />
        <ImagesWrapper>
          {images.map((img) => {
            return (
              <ImagePreview key={img.id}>
                <img src={img.src} alt={img.alt ?? 'Image'} />
              </ImagePreview>
            )
          })}
        </ImagesWrapper>
        <DataFilesWrapper>
          {dataFilesInfo.map((file) => {
            return <div key={file.id}>{file.fileName}</div>
          })}
        </DataFilesWrapper>
      </FilesWrapper>
      <div className="note-action-buttons">
        <Link to={`/notes/edit/${note.id}`}>
          <Button>EDIT</Button>
        </Link>
        <Link to={`/notes/upload/${note.id}`}>
          <Button>ADD FILE</Button>
        </Link>
        <Button onClick={deleteNote} danger={true}>
          DELETE
        </Button>
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
  errorMessage,
}

const ConnectedShowNote = connect(mapStateToProps, mapDispatchToProps)(Show)

export default ConnectedShowNote
