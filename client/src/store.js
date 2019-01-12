import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import noteReducer from './reducers/note'
import notificationReducer from './reducers/notification'
import filterReducer from './reducers/filter'
// import rootReducer from './reducers/NOTNEEDED'

const reducer = combineReducers({
	notes: noteReducer,
	notification: notificationReducer,
	filter: filterReducer
})
// const reducer = combineReducers(rootReducer)

const store = createStore(
	reducer,
	applyMiddleware(thunk)
)

export default store
