import { useState } from 'react'
import { connect } from 'react-redux'

import fileService from '../../services/fileService'
import { modifyLocally } from '../../reducers/noteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import Container from '../common/Container'
import Button from '../common/Button'

const Upload = ({
  notes,
  match,
  modifyLocally,
  notify,
  errorMessage,
  history,
}) => {
  const note = notes.find(({ id }) => id === match.params.id)
  const [file, setFile] = useState()

  const handleChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    if (!file) {
      errorMessage('No file selected')
      return
    }

    let created
    try {
      if (!file) {
        errorMessage('No file selected!')
        return
      }
      const fileData = {
        fileName: 'undefined', // TODO: Why file.name is not available here?
        title: 'Test file',
        noteId: note.id,
      }
      const { uploadUrl } = await fileService.create(fileData)
      console.log('uploadUrl', uploadUrl)
      created = await fileService.upload(file, uploadUrl)
      notify('File successfully uploaded!')
    } catch (exception) {
      errorMessage('Error while uploading file')
      console.error(exception)
    } finally {
      if (created) {
        const noteFiles = note.files || []
        const newFiles = [...noteFiles, created.id]
        console.log('newFiles', newFiles)
        modifyLocally({
          ...note,
          files: newFiles,
        })
      }
      history.push(`/notes/${note.id}`)
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

const mapStateToProps = (store) => {
  return {
    notes: store.notes,
  }
}
const mapDispatchToProps = {
  modifyLocally,
  notify,
  errorMessage,
}

export default connect(mapStateToProps, mapDispatchToProps)(Upload)
