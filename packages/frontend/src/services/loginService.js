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
  await API.post(`${baseUrl}/register`, information)
}

const login = async (credentials) => {
  const response = await API.post(`${baseUrl}/login`, credentials)
  return response.data
}

const githubVerify = async (code) => {
  const response = await API.post(`${baseUrl}/login/github/verify`, { code })
  return response.data
}

const loginService = { getUser, register, login, githubVerify }
export default loginService
