export function resolveUrl() {
  const host = window.location.host
  console.debug('host = ', host)
  // const cloudfront = 'https://d3eipmu8grncj0.cloudfront.net'
  // const heroku = 'https://my-stash.herokuapp.com'
  // const caligula = 'https://caligula.duckdns.org:8080'
  // const droplet = 'https://mystash.duckdns.org'
  const droplet = 'https://mystash.70511337.xyz'
  return host === 'localhost:3000' ? 'http://localhost:8080' : droplet
}
