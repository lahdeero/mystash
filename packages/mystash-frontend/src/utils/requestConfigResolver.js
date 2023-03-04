const getRequestConfig = (opts = {}) => {
  return {
    ...opts,
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? window.localStorage.getItem('MS_token') : ''}`
    }
  }
}
export default getRequestConfig
