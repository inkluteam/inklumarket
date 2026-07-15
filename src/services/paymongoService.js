const PAYMONGO_API_BASE = 'https://api.paymongo.com/v1'

function getPublicKey() { return localStorage.getItem('im_paymongo_pk') || '' }
function getSecretKey() { return localStorage.getItem('im_paymongo_sk') || '' }

function getHeaders(isSecret = false) {
  const key = isSecret ? getSecretKey() : getPublicKey()
  if (!key) return null
  return {
    Authorization: `Basic ${btoa(key)}`,
    'Content-Type': 'application/json',
  }
}

export async function createGCashSource({ amount, email, name, orderId, description }) {
  const headers = getHeaders(false)
  if (!headers) return { success: false, error: 'PayMongo public key not configured. Set it in Admin Settings > Payment.' }

  try {
    const res = await fetch(`${PAYMONGO_API_BASE}/sources`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(amount * 100),
            currency: 'PHP',
            type: 'gcash',
            redirect: {
              success: `${window.location.origin}/buyer/orders?payment=success&order=${orderId}`,
              failed: `${window.location.origin}/buyer/orders?payment=failed&order=${orderId}`,
              canceled: `${window.location.origin}/buyer/orders?payment=canceled&order=${orderId}`,
            },
            billing: { name, email },
            description: description || `Inclusive Market Order #${orderId}`,
          },
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.errors?.[0]?.detail || 'GCash source creation failed' }
    }

    const data = await res.json()
    return { success: true, source: data.data }
  } catch (err) {
    return { success: false, error: err.message || 'Network error creating GCash source' }
  }
}

export async function createCardSource({ amount, email, name, orderId, cardNumber, expMonth, expYear, cvc }) {
  const headers = getHeaders(false)
  if (!headers) return { success: false, error: 'PayMongo public key not configured. Set it in Admin Settings > Payment.' }

  try {
    const res = await fetch(`${PAYMONGO_API_BASE}/sources`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(amount * 100),
            currency: 'PHP',
            type: 'card',
            redirect: {
              success: `${window.location.origin}/buyer/orders?payment=success&order=${orderId}`,
              failed: `${window.location.origin}/buyer/orders?payment=failed&order=${orderId}`,
              canceled: `${window.location.origin}/buyer/orders?payment=canceled&order=${orderId}`,
            },
            billing: { name, email },
            card: { number: cardNumber, exp_month: expMonth, exp_year: expYear, cvc },
            description: description || `Inclusive Market Order #${orderId}`,
          },
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.errors?.[0]?.detail || 'Card source creation failed' }
    }

    const data = await res.json()
    return { success: true, source: data.data }
  } catch (err) {
    return { success: false, error: err.message || 'Network error creating card source' }
  }
}

export async function createPaymentIntent({ sourceId, amount, orderId }) {
  const headers = getHeaders(true)
  if (!headers) return { success: false, error: 'PayMongo secret key not configured. Set it in Admin Settings > Payment.' }

  try {
    const res = await fetch(`${PAYMONGO_API_BASE}/payment_intents`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(amount * 100),
            currency: 'PHP',
            description: `Inclusive Market Order #${orderId}`,
            payment_method: {
              type: sourceId.includes('src_') ? 'gcash' : 'card',
              details: { source_id: sourceId },
            },
            statement_descriptor: 'INCLUSIVE MKT',
          },
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.errors?.[0]?.detail || 'Payment intent creation failed' }
    }

    const data = await res.json()
    return { success: true, paymentIntent: data.data }
  } catch (err) {
    return { success: false, error: err.message || 'Network error creating payment' }
  }
}

export async function attachPaymentIntent({ paymentIntentId, sourceId }) {
  const headers = getHeaders(true)
  if (!headers) return { success: false, error: 'PayMongo secret key not configured.' }

  try {
    const res = await fetch(`${PAYMONGO_API_BASE}/payment_intents/${paymentIntentId}/attach`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          attributes: {
            source_id: sourceId,
            client_key: `im_client_${orderId}_${Date.now()}`,
          },
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.errors?.[0]?.detail || 'Payment attachment failed' }
    }

    const data = await res.json()
    return { success: true, paymentIntent: data.data }
  } catch (err) {
    return { success: false, error: err.message || 'Network error attaching payment' }
  }
}

export async function retrievePaymentIntent(paymentIntentId) {
  const headers = getHeaders(true)
  if (!headers) return { success: false, error: 'PayMongo secret key not configured.' }

  try {
    const res = await fetch(`${PAYMONGO_API_BASE}/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.errors?.[0]?.detail || 'Failed to retrieve payment' }
    }

    const data = await res.json()
    return { success: true, paymentIntent: data.data }
  } catch (err) {
    return { success: false, error: err.message || 'Network error retrieving payment' }
  }
}

export function isPayMongoConfigured(isSecret = false) {
  if (isSecret) return !!getSecretKey()
  return !!getPublicKey()
}

export function getPayMongoConfig() {
  return {
    publicKey: localStorage.getItem('im_paymongo_pk') || '',
    secretKey: localStorage.getItem('im_paymongo_sk') || '',
    configured: !!(localStorage.getItem('im_paymongo_pk') && localStorage.getItem('im_paymongo_sk')),
  }
}

export function setPayMongoConfig(publicKey, secretKey) {
  localStorage.setItem('im_paymongo_pk', publicKey)
  localStorage.setItem('im_paymongo_sk', secretKey)
}
