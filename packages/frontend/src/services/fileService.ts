import axios from 'axios'
import { resolveUrl } from '../utils/environmentResolvers'
import getRequestConfig from '../utils/requestConfigResolver'

const backendUrl = resolveUrl()
const baseUrl = backendUrl + '/api'

const scanFiles = async (noteId: any) => {
  const response = await axios.get(
    `${baseUrl}/note/files/${noteId}`,
    getRequestConfig()
  )
  console.log('response.data', response.data)

  return response.data.files
}

const getOne = async (fileId: any) => {
  const response = await axios.get(
    `${baseUrl}/file/${fileId}`,
    getRequestConfig({ responseType: 'arraybuffer' })
  )
  return response.data
}

const create = async (fileInfo: any) => {
  const response = await axios.post(
    `${baseUrl}/file`,
    fileInfo,
    getRequestConfig()
  )
  return response.data
}

const upload = async (file: any, uploadUrl: any) => {
  const response = await axios.put(uploadUrl, file)
  return response.data
}

const deleteFile = async (fileId: any) => {
  const response = await axios.delete(
    `${baseUrl}/file/${fileId}`,
    getRequestConfig()
  )
  return response.data
}

const fileService = { scanFiles, getOne, create, upload, deleteFile }
export default fileService
