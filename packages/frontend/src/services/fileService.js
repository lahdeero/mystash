import axios from 'axios'
import { resolveUrl } from '../utils/environmentResolvers'
import getRequestConfig from '../utils/requestConfigResolver'

const backendUrl = resolveUrl()
const baseUrl = backendUrl + '/api'

const getOne = async (fileId) => {
  const response = await axios.get(`${baseUrl}/files/picture/${fileId}`, getRequestConfig({ responseType: 'arraybuffer' }))
  return response.data
}

const create = async (newFileObject) => {
  console.log('newFileObject', newFileObject)
  const response = await axios.post(`${baseUrl}/files/upload`, newFileObject, getRequestConfig())
  return response.data
}


const fileService = { getOne, create }
export default fileService
