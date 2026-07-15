import { getPaymentProvider } from './paymentProviders'

const GCASH_API_BASE = 'https://payments-dev.gcash.com'

function getGcashConfig() {
  return getPaymentProvider('gcash')?.keys || {}
}

function getHeaders() {
  const { publicKey } = getGcashConfig()
  if (!publicKey) return null
  return {
    Authorization: `Bearer ${publicKey}`,
    'Content-Type': 'application/json',
  }
}

function getSecretHeaders() {
  const { secretKey } = getGcashConfig()
  if (!secretKey) return null
  return {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
  }
}

export function isGcashDirectConfigured() {
  const config = getGcashConfig()
  return !!(config.publicKey && config.secretKey)
}

export async function createGcashPayment({ amount, email, name, orderId, description }) {
  const headers = getHeaders()
  if (!headers) return { success: false, error: 'GCash API keys not configured. Set them in Admin Settings > Payments.' }

  try {
    const res = await fetch(`${GCASH_API_BASE}/v1/payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        merchant: { merchantId: getGcashConfig().merchantId || '' },
        payment: {
          amount: amount.toFixed(2),
          currency: 'PHP',
          intent: 'CHARGE',
          description: description || `Inclusive Market Order #${orderId}`,
          statement_descriptor: 'INCLUSIVE MKT',
        },
        metadata: {
          orderId,
          customerName: name,
          customerEmail: email,
        },
        redirect: {
          success: `${window.location.origin}/buyer/orders?payment=success&order=${orderId}`,
          failure: `${window.location.origin}/buyer/orders?payment=failed&order=${orderId}`,
          cancel: `${window.location.origin}/buyer/orders?payment=canceled&order=${orderId}`,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message || 'GCash payment creation failed' }
    }

    const data = await res.json()
    return { success: true, paymentId: data.paymentId, redirectUrl: data.redirectUrl, qrCode: data.qrCode }
  } catch (err) {
    return { success: false, error: err.message || 'Network error creating GCash payment' }
  }
}

export async function checkGcashPaymentStatus(paymentId) {
  const secretHeaders = getSecretHeaders()
  if (!secretHeaders) return { success: false, error: 'GCash secret key not configured.' }

  try {
    const res = await fetch(`${GCASH_API_BASE}/v1/payment/${paymentId}/status`, {
      method: 'GET',
      headers: secretHeaders,
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message || 'Failed to check GCash payment status' }
    }

    const data = await res.json()
    return { success: true, status: data.status, payment: data }
  } catch (err) {
    return { success: false, error: err.message || 'Network error' }
  }
}
