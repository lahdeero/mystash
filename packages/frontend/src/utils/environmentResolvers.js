export function resolveUrl() {
  const host = window.location.host
  console.debug('host = ', host)
  // const cloudfront = 'https://d3eipmu8grncj0.cloudfront.net'
  // const heroku = 'https://my-stash.herokuapp.com'
  // const caligula = 'https://caligula.duckdns.org:8080'
  // const droplet = 'https://mystash.duckdns.org'
  // const api = 'https://mystash.70511337.xyz'
  const api = 'https://1qmnl6hp9a.execute-api.eu-north-1.amazonaws.com'
  return host === 'localhost:3000' ? 'http://localhost:8000' : api
}
