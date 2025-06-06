import { useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import ReactMarkddown from 'react-markdown'
import styled from 'styled-components'
import { ClipLoader } from 'react-spinners'
import { useParams, useNavigate } from 'react-router-dom'

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

const FilePreview = styled.div`
  display: flex;
  img {
    max-width: 320px;
    max-height: 240px;
  }
  div {
    margin-left: 1rem;
  }
`

const Show = ({ notes, notify, removeNote }: any) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const note = notes.find((note: any) => note.id === id)

  const [dataFilesInfo, setDataFilesInfo] = useState([])
  const [imagesInfo, setImagesInfo] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const scanFiles = async (noteId: any) => {
      setLoading(true)
      try {
        const rawResponse = await fileService.scanFiles(noteId)
        const images = rawResponse.filter((file: any) =>
          IMAGE_MIME_TYPES.includes(file.mimeType)
        )
        const dataFiles = rawResponse.filter(
          (file: any) => !IMAGE_MIME_TYPES.includes(file.mimeType)
        )
        setImagesInfo(images)
        setDataFilesInfo(dataFiles)
      } catch (e) {
        console.error(e)
        notify('Could not scan files')
      }
      setLoading(false)
    }
    scanFiles(note.id)
  }, [note.id, notify])

  const deleteNote = async (event: any) => {
    event.preventDefault()
    if (window.confirm(`Are you sure you want to delete '${note.title}' ?`)) {
      const removedNote = await removeNote(note)
      if (removedNote.id.length > 0) {
        notify(`you deleted '${removedNote.title}'`)
        navigate('/')
      }
    }
  }

  const deleteFile = async (fileId: any, type: any) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await fileService.deleteFile(fileId)
        notify('File successfully deleted!')
        type === 'image'
          ? setImagesInfo(imagesInfo.filter((img: any) => img.id !== fileId))
          : setDataFilesInfo(dataFilesInfo.filter((file: any) => file.id !== fileId))
      } catch (e) {
        console.error(e)
        notify('Could not delete file')
      }
    }
  }

  const tags = note.tags.join()
  const text = note.content
  const markdown = tags.includes('markdown')

  const RenderContent = () => (
    <ContentWrapper>
      {text.split('\n').map(function (row: any, key: any) {
        return (
          <span key={key}>
            {row}
            <br />
          </span>
        )
      })}
    </ContentWrapper>
  )

  if (!note) {
    return <div>Could not find note</div>
  }
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
          {imagesInfo.map((img: any) => {
            return (
              <ImagePreview key={img.id}>
                <div>
                  <button onClick={() => deleteFile(img.id, 'image')}>X</button>
                </div>
                <a href={img.url} target="_blank" rel="noreferrer">
                  <img src={img.url} alt={img.fileName} />
                </a>
              </ImagePreview>
            )
          })}
        </ImagesWrapper>
        <DataFilesWrapper>
          {dataFilesInfo.map((file: any) => (
            <FilePreview key={file.id}>
              <a href={file.url} target="_blank" rel="noreferrer">
                <div key={file.id}>{file.fileName}</div>
              </a>
              <div>
                <button onClick={() => deleteFile(file.id, 'file')}>X</button>
              </div>
            </FilePreview>
          ))}
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

const mapStateToProps = (store: any) => {
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
