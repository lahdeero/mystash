import API from 'axios'

const baseUrl = '/api/notes/directory'

let token = null
let config = {}
let user_id = null

const setToken = (id, newToken) => {
	user_id = id
	token = `bearer ${newToken}`
	config = { headers: { 'Authorization': token } }
}

// REMEMBER ALWAYS TO ADD EXPORT DEFAULT!!!!!!!!!
const getAll = async () => {
  const response = await API.get(baseUrl + '/' + user_id + '/all', config)
	return response.data
}

const getOne = async (id) => {
	const response = await API.get(baseUrl + '/note/' + id, config)
	return response.data
}

const create =  async (newObject) => {
  const request = await API.post(baseUrl, newObject, config)
	return request.data
}

const modify = async (noteObject) => {
	const id = await noteObject.id
	const request = await API.put(baseUrl + '/note/' + id, noteObject, config)
	return request
}

const erase = async (id) => {
	const response = await API.delete(`${baseUrl}/note/${id}`, config)
	console.log('response ' + response.data)
	return response.data
}

export default { getAll,getOne,create,modify,erase,setToken }
