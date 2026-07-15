const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

let tokenClient = null
let googleInitPromise = null

function loadGIS() {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-gis')) return resolve()
    const script = document.createElement('script')
    script.id = 'google-gis'
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export async function initGoogleAuth() {
  if (googleInitPromise) return googleInitPromise
  googleInitPromise = (async () => {
    await loadGIS()
    await new Promise(r => setTimeout(r, 100))
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      callback: () => {},
    })
  })()
  return googleInitPromise
}

export async function triggerGoogleLogin() {
  await initGoogleAuth()
  if (!tokenClient) throw new Error('Google auth not initialized')

  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error))
      } else {
        fetchGoogleUserInfo(response.access_token)
          .then(resolve)
          .catch(reject)
      }
    }
    tokenClient.error_callback = (err) => reject(new Error(err.type || 'Google login failed'))

    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

async function fetchGoogleUserInfo(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch Google user info')
  const data = await res.json()

  return {
    id: data.sub,
    name: data.name,
    email: data.email,
    picture: data.picture,
    emailVerified: data.email_verified,
    provider: 'google',
  }
}

export function getStoredGoogleToken() {
  return localStorage.getItem('im_google_access_token')
}

export function storeGoogleToken(token) {
  localStorage.setItem('im_google_access_token', token)
}

export function clearGoogleToken() {
  localStorage.removeItem('im_google_access_token')
}
