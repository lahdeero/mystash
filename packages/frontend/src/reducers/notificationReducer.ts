type NotificationState = string[]
const initialState: NotificationState = []

const notificationReducer = (store = initialState, action: any) => {
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

export const notify = (notification: any) => {
  return (dispatch: any) => {
    dispatch({
      type: 'NOTIFY',
      data: notification,
    })
  }
}

export const errorMessage = (notification: any) => {
  return (dispatch: any) => {
    dispatch({
      type: 'ERROR',
      data: notification,
    })
  }
}

export const hideNotification = () => {
  return (dispatch: any) => {
    dispatch({
      type: 'HIDE_NOTIFICATION',
    })
  }
}

export default notificationReducer
