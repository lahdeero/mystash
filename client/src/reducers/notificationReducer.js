const notificationReducer = (store = ' ', action) => {
  switch (action.type) {
    case 'NOTIFY':
      store = action.data
      return [store, action.data]
		case 'ERROR':
			store = action.data
			return [store, action.data]
    case 'HIDE_NOTIFICATION':
      store = ''
      return store
		case 'HIDE_ERROR':
			store = ''
			return store
    default:
      return store
  }
}

export const notify = (notification, timer) => {
  return async (dispatch) => {
    dispatch({
      type: 'NOTIFY',
			data: notification
    })
    setTimeout(() => {
      dispatch({ type: 'HIDE_NOTIFICATION' })
    }, timer * 1000)
  }
}

export const errormessage = (notification, timer) => {
  return async (dispatch) => {
    dispatch({
      type: 'ERROR',
			data: notification
    })
    setTimeout(() => {
      dispatch({ type: 'HIDE_ERROR' })
    }, timer * 1000)
  }
}

export default notificationReducer
