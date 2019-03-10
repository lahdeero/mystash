import { combineReducers } from 'redux'
import user from './userReducer'
import notes from './noteReducer'
import notification from './notificationReducer'

export default combineReducers({
  user,
  notes,
  notification
})
