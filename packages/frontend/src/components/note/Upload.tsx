import { useState } from 'react'
import { connect } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import fileService from '../../services/fileService'
import { modifyLocally } from '../../reducers/noteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import Container from '../common/Container'
import Button from '../common/Button'

const Upload = ({ notes, modifyLocally, notify, errorMessage }) => {
  const { id } = useParams()
  const navigate = useNavigate()

  const note = notes.find(({ id: noteId }) => noteId === id)
  const [file, setFile] = useState<File | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) {
      errorMessage('No file selected')
      return
    }

    let created
    try {
      const fileData = {
        fileName: file.name,
        title: 'Test file',
        noteId: note.id,
      }
      const { uploadUrl } = await fileService.create(fileData)
      created = await fileService.upload(file, uploadUrl)
      notify('File successfully uploaded!')
    } catch (exception) {
      errorMessage('Error while uploading file')
      console.error(exception)
    } finally {
      if (created) {
        const noteFiles = note.files || []
        const newFiles = [...noteFiles, created.id]
        modifyLocally({
          ...note,
          files: newFiles,
        })
      }
      navigate(`/notes/${note.id}`)
    }
  }

  return (
    <Container>
      <div>Upload file:</div>
      <div>
        <form>
          <div>
            <input type="file" onChange={handleChange} max={1} />
          </div>
          <div>
            <Button onClick={handleSubmit}>UPLOAD</Button>
          </div>
        </form>
      </div>
    </Container>
  )
}

const mapStateToProps = (store) => ({
  notes: store.notes,
})

const mapDispatchToProps = {
  modifyLocally,
  notify,
  errorMessage,
}

export default connect(mapStateToProps, mapDispatchToProps)(Upload)
