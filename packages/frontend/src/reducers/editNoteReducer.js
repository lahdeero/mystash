const defaultCurrentNote = {
  id: null,
  title: '',
  content: '',
  tagText: '',
  tags: [],
  newTags: [],
}

const editNoteReducer = (store = defaultCurrentNote, action = { type: 'DEFAULT' }) => {
  switch (action.type) {
  case 'UPDATE_EDIT':
    return {
      ...store,
      ...action.data
    }
  case 'CLEAR_EDIT':
    return defaultCurrentNote
  default:
    return store
  }
}

export const updateEditNote = (current) => {
  return (dispatch) => {
    dispatch({
      type: 'UPDATE_EDIT',
      data: current
    })
  }
}

export const clearEditNote = () => {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_EDIT',
      data: {}
    })
  }
}

export default editNoteReducer
