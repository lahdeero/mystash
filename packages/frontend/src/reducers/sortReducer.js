export const sortOptions = ['ALPHABETIC', 'CREATED', 'MODIFIED']
const defaultSort = 'MODIFIED'

const sortReducer = (store = defaultSort, action = { type: 'DEFAULT' }) => {
  if (!action.type || !sortOptions.includes(action.type)) return store

  return action.type
}

export const sortAlphabetic = () => {
  return (dispatch) => {
    dispatch({
      type: 'ALPHABETIC',
    })
  }
}

export const sortCreated = () => {
  return (dispatch) => {
    dispatch({
      type: 'CREATED',
    })
  }
}

export const sortModified = () => {
  return (dispatch) => {
    dispatch({
      type: 'MODIFIED',
    })
  }
}

export default sortReducer