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
import { loadState, saveState } from './utils/storage'

const preloadedState = loadState() as Partial<{
  user: ReturnType<typeof user>
  notes: ReturnType<typeof notes>
}>

const store = configureStore({
  reducer: {
    user,
    notes,
    notification,
    currentNote,
    editNote,
    sortNotes,
  },
  preloadedState,
})

store.subscribe(() => {
  saveState(store.getState())
})

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')
const root = createRoot(rootEl)
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)
