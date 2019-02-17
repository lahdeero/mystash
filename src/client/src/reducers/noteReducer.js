import noteService from '../services/NoteService.js'

const noteReducer = (store = [], action) => {
  console.log(action.data)
  switch (action.type) {
    case 'CREATE':
      store.unshift(action.data)
      return store
    case 'MODIFY':
      return store.map(note => (note.id === action.data[0].id) ? action.data[0] : note)
    case 'REMOVE':
      return store.filter(note => note.id !== action.data)
    case 'INIT_NOTES':
      return action.data
    case 'CLEAR':
      return (store = [])
    default:
      return store
  }
}

export const noteInitialization = () => {
  return async (dispatch) => {
    const notes = await noteService.getAll()
    dispatch({
      type: 'INIT_NOTES',
      data: notes
    })
  }
}

export const clearNotes = () => {
  return async (dispatch) => {
    dispatch({
      type: 'CLEAR',
      data: []
    })
  }
}

export const createButDontSave = (noteObject) => {
  return async (dispatch) => {
    dispatch({
      type: 'CREATE',
      data: noteObject
    })
  }
}

export const createNote = (noteObject) => {
  return async (dispatch) => {
    const savedNoteObject = await noteService.create(noteObject)
    dispatch({
      type: 'CREATE',
      data: savedNoteObject[0]
    })
    return savedNoteObject[0].id
  }
}

export const modifyNote = (noteObject) => {
  return async (dispatch) => {
    await noteService.modify(noteObject)
    const modifiedNoteObject = await noteService.getOne(noteObject.id)
    await dispatch({
      type: 'MODIFY',
      data: modifiedNoteObject
    })
  }
}

export const removeNote = (id) => {
  return async (dispatch) => {
    const delId = await noteService.erase(id)
    dispatch({
      type: 'REMOVE',
      data: id
    })
    return delId
  }
}

export default noteReducer
