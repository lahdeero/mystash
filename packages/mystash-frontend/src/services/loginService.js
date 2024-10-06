import API from 'axios'
import { resolveUrl } from '../utils/environmentResolvers'
import getRequestConfig from '../utils/requestConfigResolver'

const backendUrl = resolveUrl()
const baseUrl = backendUrl + '/api'

const getUser = async () => {
  const response = await API.get(`${baseUrl}/user`, getRequestConfig())
  return response.data
}

const register = async (information) => {
  const response = await API.post(`${baseUrl}/user`, information)
  console.debug(response.data)
  return response.data
}

const login = async (credentials) => {
  const response = await API.post(`${baseUrl}/login`, credentials)
  return response.data
}

const loginService = { getUser, register, login }
export default loginService
