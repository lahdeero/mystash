import API from 'axios'
import type { AxiosResponse } from 'axios'
import { resolveUrl } from '../utils/environmentResolvers'
import getRequestConfig from '../utils/requestConfigResolver'
import type {
  GetNotesResponse,
  CreateNoteResponse,
  UpdateNoteResponse,
  DeleteNoteResponse,
} from '@mystash/shared'

const backendUrl = resolveUrl()
const baseUrl = backendUrl + '/api/note'

const getAll = async (): Promise<GetNotesResponse> => {
  const response: AxiosResponse<GetNotesResponse> = await API.get(
    `${baseUrl}`,
    getRequestConfig()
  )
  console.debug(response)
  return response.data
}

const create = async (newObject: any): Promise<CreateNoteResponse> => {
  const response: AxiosResponse<CreateNoteResponse> = await API.post(
    baseUrl,
    newObject,
    getRequestConfig()
  )
  return response.data
}

const modify = async (noteObject: any): Promise<UpdateNoteResponse> => {
  const response: AxiosResponse<UpdateNoteResponse> = await API.put(
    `${baseUrl}/${noteObject.id}`,
    noteObject,
    getRequestConfig()
  )
  return response.data
}

const erase = async (id: any): Promise<DeleteNoteResponse> => {
  const response: AxiosResponse<DeleteNoteResponse> = await API.delete(
    `${baseUrl}/${id}`,
    getRequestConfig()
  )
  return response.data
}

const noteService = { getAll, create, modify, erase }
export default noteService
