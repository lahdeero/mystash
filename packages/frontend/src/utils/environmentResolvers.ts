export const resolveUrl = () => {
  const host = window.location.host
  const api = 'https://1qmnl6hp9a.execute-api.eu-north-1.amazonaws.com'
  return host === 'localhost:3000' ? 'http://localhost:8000' : api
}
