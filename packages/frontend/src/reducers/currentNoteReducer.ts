import type { AnyAction } from '@reduxjs/toolkit'

type CurrentNoteState = any
const initialState: CurrentNoteState = {
  title: '',
  content: '',
  tagText: '',
  tags: [],
}

interface CurrentNoteAction extends AnyAction {
  type: string
  data: any
}

const defaultAction: CurrentNoteAction = {
  type: 'DEFAULT',
  data: {},
}

const currentNoteReducer = (
  store = initialState,
  action: AnyAction = defaultAction
) => {
  switch (action.type) {
    case 'UPDATE_CURRENT':
      return {
        ...store,
        ...action.data,
      }
    case 'CLEAR_CURRENT':
      return initialState
    default:
      return store
  }
}

export const updateCurrentNote = (current: any) => {
  return (dispatch: any) => {
    dispatch({
      type: 'UPDATE_CURRENT',
      data: current,
    })
  }
}

export const clearCurrentNote = () => {
  return (dispatch: any) => {
    dispatch({
      type: 'CLEAR_CURRENT',
      data: {},
    })
  }
}

export default currentNoteReducer
