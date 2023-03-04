import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import fileService from '../../services/fileService'
import { modifyLocally } from '../../reducers/noteReducer'
import { notify, errorMessage } from '../../reducers/notificationReducer'
import Container from '../common/Container'
import Button from '../common/Button'

const Upload = ({ notes, match, modifyLocally, notify, errorMessage, history }) => {
  const note = notes.find(({ id }) => id === parseInt(match.params.id))
  const [file, setFile] = useState()

  const handleChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!file) {
      errorMessage('No file selected')
      return
    }

    const formData = new FormData()
    formData.append(
      'note_id',
      note.id,
    )
    formData.append(
      'picture',
      file,
      file.name
    )

    let created
    try {
      created = await fileService.create(formData)
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
          files: newFiles
        })
      }
      history.push(`/notes/${note.id}`)
    }
  }

  return (
    <Container>
      <div>
        Upload file:
      </div>
      <div>
        <form>
          <div>
            <input type="file" onChange={handleChange} />
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
  errorMessage
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(Upload))
