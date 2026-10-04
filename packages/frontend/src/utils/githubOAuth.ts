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
  try {
    const parts = state.split('.')
    if (parts.length !== 2) throw new Error('Malformed state')
    const payload = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.nonce !== nonce || !Number.isSafeInteger(payload.expiresAt) || payload.expiresAt <= Date.now()) throw new Error('Mismatched or expired state')
  } catch {
    throw new Error('Invalid GitHub login attempt. Please try again.')
  }
  return { code, state, nonce }
}
