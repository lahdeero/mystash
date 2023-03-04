const defaultCurrentNote = {
  title: '',
  content: '',
  tagText: '',
  tags: []
}

const currentNoteReducer = (store = defaultCurrentNote, action = { type: 'DEFAULT' }) => {
  switch (action.type) {
  case 'UPDATE_CURRENT':
    return {
      ...store,
      ...action.data
    }
  case 'CLEAR_CURRENT':
    return defaultCurrentNote
  default:
    return store
  }
}

export const updateCurrentNote = (current) => {
  return (dispatch) => {
    dispatch({
      type: 'UPDATE_CURRENT',
      data: current
    })
  }
}

export const clearCurrentNote = () => {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_CURRENT',
      data: {}
    })
  }
}

export default currentNoteReducer
