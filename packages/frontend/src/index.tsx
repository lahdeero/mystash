import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
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
  },
})

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')
const root = createRoot(rootEl)
// TODO: Upgrade react-router-dom to v6 and remove the @ts-ignore
// @ts-ignore
root.render(<BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)
