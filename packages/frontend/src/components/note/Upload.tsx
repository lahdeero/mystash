import { useState } from 'react'
import { connect } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import fileService from '../../services/fileService'
import { modifyLocally } from '../../reducers/noteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import Container from '../common/Container'
import Button from '../common/Button'
import type { Note } from '@mystash/shared'

const Dropzone = styled.div<{ isActive: boolean }>`
  margin: 1rem 0;
  padding: 2rem;
  border: 2px dashed ${({ theme }) => theme.Border};
  border-radius: 1rem;
  background-color: ${({ isActive }) =>
    isActive ? 'rgba(66, 153, 225, 0.1)' : 'transparent'};
  color: ${({ theme }) => theme.Text};
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(66, 153, 225, 0.08);
  }
`

const FileInfo = styled.div`
  margin: 1rem 0;
  color: ${({ theme }) => theme.Text};
`

const Upload = ({ notes, modifyLocally, notify, errorMessage }: any) => {
  const { id } = useParams()
  const navigate = useNavigate()

  const note = notes.find((n: Note) => n.id === id)
  const [files, setFiles] = useState<File[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  if (!note) {
    return (
      <Container>
        <div>Could not find note</div>
      </Container>
    )
  }

  const selectFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles)
    }
    setIsDragActive(false)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      selectFiles(Array.from(event.target.files))
    }
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      selectFiles(Array.from(event.dataTransfer.files))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (files.length === 0) {
      errorMessage('No files selected')
      return
    }

    const uploadedIds: string[] = []
    try {
      for (const file of files) {
        const fileData = {
          fileName: file.name,
          title: file.name,
          noteId: note.id,
        }
        const created = await fileService.create(fileData)
        const uploadUrl = created?.uploadUrl
        const fileId = created?.id
        if (!uploadUrl) {
          throw new Error('Missing upload URL')
        }
        await fileService.upload(file, uploadUrl)
        if (fileId) {
          uploadedIds.push(fileId)
        }
      }
      notify(`${uploadedIds.length} file(s) successfully uploaded!`)
    } catch (exception) {
      errorMessage('Error while uploading files')
      console.error(exception)
      return
    }

    try {
      const serverFiles = await fileService.scanFiles(note.id)
      const serverFileIds = serverFiles.map((f: any) => f.id)
      const noteFiles = note.files || []
      const newFiles = [...noteFiles, ...serverFileIds.filter((id: string) => !noteFiles.includes(id))]
      if (newFiles.length > 0) {
        modifyLocally({
          ...note,
          files: newFiles,
        })
      }
    } catch (e) {
      console.error('Could not refresh files after upload', e)
    }

    navigate(`/notes/${note.id}`)
  }

  return (
    <Container>
      <div>Upload files:</div>
      <div>
        <form onSubmit={handleSubmit} data-testid="upload-form">
          <Dropzone
            isActive={isDragActive}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div>
              {files.length > 0 ? (
                <strong>{files.length} file(s) selected</strong>
              ) : (
                'Drop files here, or click to select one or more.'
              )}
            </div>
            <input
              id="file-input"
              data-testid="upload-file-input"
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleChange}
            />
          </Dropzone>
          {files.length > 0 && (
            <FileInfo>
              <div>Selected files:</div>
              <ul>
                {files.map((file) => (
                  <li key={file.name + file.size}>{file.name}</li>
                ))}
              </ul>
            </FileInfo>
          )}
          <Button type="submit">UPLOAD</Button>
        </form>
      </div>
    </Container>
  )
}

export const UploadComponent = Upload

const mapStateToProps = (store: any) => ({
  notes: store.notes,
})

const mapDispatchToProps = {
  modifyLocally,
  notify,
  errorMessage,
}

export default connect(mapStateToProps, mapDispatchToProps)(Upload)
