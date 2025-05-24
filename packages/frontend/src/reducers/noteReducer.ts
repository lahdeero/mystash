import noteService from '../services/noteService'

const noteReducer = (store = [], action: any) => {
  switch (action.type) {
    case 'CREATE':
      return [action.data, ...store]
    case 'MODIFY':
      return [
        action.data,
        ...store.filter((note: any) => note.id !== action.data.id),
      ]
    case 'REMOVE':
      return store.filter((note: any) => note.id !== action.data.id)
    case 'INIT_NOTES':
      return action.data
    case 'CLEAR':
      return []
    default:
      return store
  }
}

export const noteInitialization = () => {
  return async (dispatch: any) => {
    const notes = await noteService.getAll()
    console.debug('INIT NOTES', notes)
    dispatch({
      type: 'INIT_NOTES',
      data: notes,
    })
  }
}

export const clearNotes = () => {
  return async (dispatch: any) => {
    dispatch({
      type: 'CLEAR',
      data: [],
    })
  }
}

export const createNote = (noteObject: any) => {
  return async (dispatch: any) => {
    const createdNoteObject = await noteService.create(noteObject)

    // TODO: backend doesn't return newly created tags
    const combinedNoteObject = {
      ...createdNoteObject,
      tags: [
        ...new Set(
          [...createdNoteObject.tags, ...noteObject.tags].filter(
            (e) => typeof e === 'string' && e.length > 1
          )
        ),
      ],
    }

    await dispatch({
      type: 'CREATE',
      data: combinedNoteObject,
    })
    return combinedNoteObject
  }
}

export const modifyNote = (noteObject: any) => {
  return async (dispatch: any) => {
    const modifiedNoteObject = await noteService.modify(noteObject)
    dispatch({
      type: 'MODIFY',
      data: modifiedNoteObject,
    })
  }
}

export const modifyLocally = (noteObject: any) => {
  return (dispatch: any) => {
    dispatch({
      type: 'MODIFY',
      data: noteObject,
    })
  }
}

export const removeNote = (noteObject: any) => {
  return async (dispatch: any) => {
    const { id: delId } = await noteService.erase(noteObject.id)
    console.log('deleted id', delId)
    const removedNote = { ...noteObject, id: delId }
    setTimeout(() => {
      dispatch({
        type: 'REMOVE',
        data: removedNote,
      })
    }, 10)

    return removedNote
  }
}

export default noteReducer
