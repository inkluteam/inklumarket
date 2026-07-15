import { getPaymentProvider } from './paymentProviders'

const MAYA_API_BASE = 'https://payapi.maya.ph'

function getMayaConfig() {
  return getPaymentProvider('maya')?.keys || {}
}

function getHeaders() {
  const { publicKey } = getMayaConfig()
  if (!publicKey) return null
  return {
    Authorization: `Bearer ${publicKey}`,
    'Content-Type': 'application/json',
  }
}

function getSecretHeaders() {
  const { secretKey } = getMayaConfig()
  if (!secretKey) return null
  return {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
  }
}

export function isMayaConfigured() {
  const config = getMayaConfig()
  return !!(config.publicKey && config.secretKey)
}

export async function createMayaQRCode({ amount, email, name, orderId, description }) {
  const headers = getHeaders()
  if (!headers) return { success: false, error: 'Maya public key not configured. Set it in Admin Settings > Payments.' }

  try {
    const res = await fetch(`${MAYA_API_BASE}/v1/qr-codes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        code: `IM-${orderId}`,
        type: 'MERCHANT',
        amount: { value: amount.toFixed(2), currency: 'PHP' },
        name: name || 'Inclusive Market',
        description: description || `Order #${orderId}`,
        logoUrl: `${window.location.origin}/logo.png`,
        websiteUrl: window.location.origin,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message || 'Maya QR code creation failed' }
    }

    const data = await res.json()
    return { success: true, qrCode: data.code, qrUrl: data.qrCodeUrl || data.code }
  } catch (err) {
    return { success: false, error: err.message || 'Network error creating Maya QR' }
  }
}

export async function createMayaPayment({ amount, email, name, orderId, description }) {
  const headers = getHeaders()
  if (!headers) return { success: false, error: 'Maya public key not configured.' }

  try {
    const res = await fetch(`${MAYA_API_BASE}/v1/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        totalAmount: { value: amount.toFixed(2), currency: 'PHP' },
        merchant: { name: 'Inclusive Market' },
        paymentReference: orderId,
        metadata: {
          orderId,
          customerName: name,
          customerEmail: email,
        },
        redirectUrl: {
          success: `${window.location.origin}/buyer/orders?payment=success&order=${orderId}`,
          failure: `${window.location.origin}/buyer/orders?payment=failed&order=${orderId}`,
          cancel: `${window.location.origin}/buyer/orders?payment=canceled&order=${orderId}`,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message || 'Maya payment creation failed' }
    }

    const data = await res.json()
    return { success: true, paymentId: data.paymentId, redirectUrl: data.redirectUrl }
  } catch (err) {
    return { success: false, error: err.message || 'Network error creating Maya payment' }
  }
}

export async function checkMayaPaymentStatus(paymentId) {
  const secretHeaders = getSecretHeaders()
  if (!secretHeaders) return { success: false, error: 'Maya secret key not configured.' }

  try {
    const res = await fetch(`${MAYA_API_BASE}/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: secretHeaders,
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message || 'Failed to check Maya payment status' }
    }

    const data = await res.json()
    return { success: true, status: data.status, payment: data }
  } catch (err) {
    return { success: false, error: err.message || 'Network error' }
  }
}
