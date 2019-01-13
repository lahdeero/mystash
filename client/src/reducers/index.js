import { combineReducers } from 'redux'
import user from './userReducer'
import notes from './noteReducer'
import filter from './filterReducer'
import notification from './notificationReducer'

export default combineReducers({
  user,
  notes,
  filter,
  notification
})
