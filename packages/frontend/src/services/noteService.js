import API from 'axios'
import { resolveUrl } from '../utils/environmentResolvers'
import getRequestConfig from '../utils/requestConfigResolver'

const backendUrl = resolveUrl()
const baseUrl = backendUrl + '/api/note'

const getAll = async () => {
  const response = await API.get(`${baseUrl}`, getRequestConfig())
  console.debug(response)
  return response.data
}

const create = async (newObject) => {
  const response = await API.post(baseUrl, newObject, getRequestConfig())
  return response.data
}

const modify = async (noteObject) => {
  const response = await API.put(`${baseUrl}/${noteObject.id}`, noteObject, getRequestConfig())
  return response.data
}

const erase = async (id) => {
  const response = await API.delete(`${baseUrl}/${id}`, getRequestConfig())
  return response.data
}

const noteService = { getAll, create, modify, erase }
export default noteService
