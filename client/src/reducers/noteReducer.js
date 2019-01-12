import noteService from '../services/NoteService.js'

const noteReducer = (store = [], action) => {
	switch(action.type) {
		case 'CREATE':
			return [
				...store,
				{
					id: action.data.id,
					title: action.data.title,
					content: action.data.content,
					tags: action.data.tags 
				}
			]
		case 'MODIFY':
			return store.map(note => (note.id === action.data[0].id) ? action.data[0] : note)
		case 'REMOVE':
			return store.filter(note => note.id !== action.data)
		case 'INIT_NOTES':
			return action.data
		case 'CLEAR':
			return store = []
		default:
			return store
	}
}

export const noteInitialization = () => {
	return async (dispatch) => {
		const notes = await noteService.getAll()
		dispatch({
			type: 'INIT_NOTES',
			data: notes
		})
	}
}

export const clearNotes = () => {
	return async (dispatch) => {
		dispatch({
			type: 'CLEAR',
			data: null
		})
	}
}

export const createNote = (noteObject) => {
	return async (dispatch) => {
		const saved_noteObject = await noteService.create(noteObject)
		dispatch({
			type: 'CREATE',
			data: saved_noteObject[0]
		})
		return saved_noteObject[0].id
	}
}

export const modifyNote = (noteObject) => {
	return async (dispatch) => {
		await noteService.modify(noteObject)
		const modified_noteObject = await noteService.getOne(noteObject.id)
		await dispatch({
			type: 'MODIFY',
			data: modified_noteObject
		})
	}
}

export const removeNote = (id) => {
	return async (dispatch) => {
		const del_id = await noteService.erase(id)
		dispatch({
			type: 'REMOVE',
			data: id
		})
		return del_id
	}
}

export default noteReducer
