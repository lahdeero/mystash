import API from 'axios'
import type { AxiosResponse } from 'axios'
import { resolveUrl } from '../utils/environmentResolvers'
import getRequestConfig from '../utils/requestConfigResolver'
import type { User, UserToken } from '@mystash/shared'

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

const register = async (information: any): Promise<void> => {
  await API.post(`${baseUrl}/register`, information)
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

const loginService = { getUser, register, login, githubVerify }
export default loginService
