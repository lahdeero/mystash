import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyMiddleware } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import notes from './reducers/noteReducer'
import user from './reducers/userReducer'
import notification from './reducers/notificationReducer'
import currentNote from './reducers/currentNoteReducer'
import editNote from './reducers/editNoteReducer'
import sortNotes from './reducers/sortReducer'

const store = configureStore({
  reducer: {
    user,
    notes,
    notification,
    currentNote,
    editNote,
    sortNotes,
  }
}, applyMiddleware(thunk))

const root = createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)
