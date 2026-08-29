import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
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

export const store = configureStore({
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

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
