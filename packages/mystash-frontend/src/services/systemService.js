import axios from 'axios'
import { resolveUrl } from '../utils/environmentResolvers'

const backendUrl = resolveUrl()
const baseUrl = backendUrl + '/api/systeminfo'

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

export default { getAll }
