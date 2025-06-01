import type { AnyAction } from '@reduxjs/toolkit'

type EditNoteState = any
const defaultCurrentNote: EditNoteState = {
  id: null,
  title: '',
  content: '',
  tagText: '',
  tags: [],
  newTags: [],
}

interface EditNoteAction extends AnyAction {
  type: string
  data: any
}

const defaultAction: EditNoteAction = {
  type: 'DEFAULT',
  data: {},
}

const editNoteReducer = (
  store = defaultCurrentNote,
  action: AnyAction = defaultAction
) => {
  switch (action.type) {
    case 'UPDATE_EDIT':
      return {
        ...store,
        ...action.data,
      }
    case 'CLEAR_EDIT':
      return defaultCurrentNote
    default:
      return store
  }
}

export const updateEditNote = (current: any) => {
  return (dispatch: any) => {
    dispatch({
      type: 'UPDATE_EDIT',
      data: current,
    })
  }
}

export const clearEditNote = () => {
  return (dispatch: any) => {
    dispatch({
      type: 'CLEAR_EDIT',
      data: {},
    })
  }
}

export default editNoteReducer
