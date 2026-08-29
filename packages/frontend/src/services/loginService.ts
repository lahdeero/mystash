import API from 'axios'
import type { AxiosResponse } from 'axios'
import { resolveUrl } from '../utils/environmentResolvers'
import getRequestConfig from '../utils/requestConfigResolver'
import type { User, UserToken, RegisterRequest, ErrorResponse } from '@mystash/shared'

const backendUrl = resolveUrl()
const baseUrl = backendUrl + '/api'

const getUser = async (): Promise<User> => {
  const response: AxiosResponse<UserToken> = await API.get(
    `${baseUrl}/user`,
    getRequestConfig()
  )
  const { user } = response.data
  return user
}

const register = async (information: RegisterRequest): Promise<User | ErrorResponse> => {
  const response = await API.post(`${baseUrl}/register`, information)
  return response.data
}

const login = async (credentials: any): Promise<UserToken> => {
  const response: AxiosResponse<UserToken> = await API.post(
    `${baseUrl}/login`,
    credentials
  )
  return response.data
}

// TODO: Typing
const githubVerify = async (code: any): Promise<any> => {
  const response: AxiosResponse<any> = await API.post(
    `${baseUrl}/login/github/verify`,
    { code }
  )
  return response.data
}

const editUserSettings = async (settings: Record<string, unknown>): Promise<User> => {
  const response: AxiosResponse<User> = await API.put(
    `${baseUrl}/user/settings`,
    settings,
    getRequestConfig()
  )
  return response.data
}

const loginService = { getUser, register, login, githubVerify, editUserSettings }
export default loginService
