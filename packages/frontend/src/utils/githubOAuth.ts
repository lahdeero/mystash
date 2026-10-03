const STORAGE_KEY = 'MS_github_oauth_nonce'

export const startGitHubOAuth = (loginUrl: string): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const nonce = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  sessionStorage.setItem(STORAGE_KEY, nonce)
  const url = new URL(loginUrl)
  url.searchParams.set('nonce', nonce)
  return url.toString()
}

export const consumeGitHubOAuth = (code: unknown, state: unknown) => {
  const nonce = sessionStorage.getItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
  if (!nonce || typeof code !== 'string' || !code || typeof state !== 'string' || !state) {
    throw new Error('Invalid GitHub login attempt. Please try again.')
  }
  return { code, state, nonce }
}
