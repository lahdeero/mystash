const notificationReducer = (store = [], action) => {
  switch (action.type) {
  case 'NOTIFY':
    return [action.data, ...store]
  case 'ERROR':
    return [action.data, ...store]
  case 'HIDE_NOTIFICATION':
    return []
  default:
    return store
  }
}

export const notify = (notification) => {
  return (dispatch) => {
    dispatch({
      type: 'NOTIFY',
      data: notification
    })
  }
}

export const errorMessage = (notification) => {
  return (dispatch) => {
    dispatch({
      type: 'ERROR',
      data: notification
    })
  }
}

export const hideNotification = () => {
  return (dispatch) => {
    dispatch({
      type: 'HIDE_NOTIFICATION',
    })
  }
}

export default notificationReducer
