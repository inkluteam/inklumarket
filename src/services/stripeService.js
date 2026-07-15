import { getPaymentProvider } from './paymentProviders'

const STRIPE_API_BASE = 'https://api.stripe.com/v1'

function getStripeConfig() {
  return getPaymentProvider('stripe')?.keys || {}
}

function getHeaders() {
  const { secretKey } = getStripeConfig()
  if (!secretKey) return null
  return {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }
}

export function isStripeConfigured() {
  const config = getStripeConfig()
  return !!(config.publishableKey && config.secretKey)
}

export async function createStripeCheckoutSession({ amount, currency, email, name, orderId, items }) {
  const headers = getHeaders()
  if (!headers) return { success: false, error: 'Stripe secret key not configured. Set it in Admin Settings > Payments.' }

  try {
    const params = new URLSearchParams()
    params.append('payment_method_types[]', 'card')
    params.append('mode', 'payment')
    params.append('customer_email', email)
    params.append('success_url', `${window.location.origin}/buyer/orders?payment=success&order=${orderId}`)
    params.append('cancel_url', `${window.location.origin}/buyer/orders?payment=failed&order=${orderId}`)
    params.append('metadata[orderId]', orderId)
    params.append('metadata[platform]', 'inclusive-market')

    items.forEach((item, i) => {
      params.append(`line_items[${i}][price_data][currency]`, currency || 'php')
      params.append(`line_items[${i}][price_data][product_data][name]`, item.name)
      params.append(`line_items[${i}][price_data][unit_amount]`, Math.round(item.price * 100))
      params.append(`line_items[${i}][quantity]`, item.quantity || 1)
    })

    const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
      method: 'POST',
      headers,
      body: params.toString(),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error?.message || 'Stripe session creation failed' }
    }

    const session = await res.json()
    return { success: true, sessionId: session.id, url: session.url }
  } catch (err) {
    return { success: false, error: err.message || 'Network error creating Stripe session' }
  }
}

export async function createStripePaymentIntent({ amount, currency, email, orderId }) {
  const headers = getHeaders()
  if (!headers) return { success: false, error: 'Stripe secret key not configured.' }

  try {
    const params = new URLSearchParams()
    params.append('amount', Math.round(amount * 100))
    params.append('currency', currency || 'php')
    params.append('receipt_email', email)
    params.append('metadata[orderId]', orderId)

    const res = await fetch(`${STRIPE_API_BASE}/payment_intents`, {
      method: 'POST',
      headers,
      body: params.toString(),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error?.message || 'Payment intent creation failed' }
    }

    const intent = await res.json()
    return { success: true, clientSecret: intent.client_secret, paymentIntentId: intent.id }
  } catch (err) {
    return { success: false, error: err.message || 'Network error' }
  }
}

export async function retrieveStripePaymentIntent(paymentIntentId) {
  const headers = getHeaders()
  if (!headers) return { success: false, error: 'Stripe secret key not configured.' }

  try {
    const res = await fetch(`${STRIPE_API_BASE}/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error?.message || 'Failed to retrieve payment' }
    }

    const intent = await res.json()
    return { success: true, status: intent.status, paymentIntent: intent }
  } catch (err) {
    return { success: false, error: err.message || 'Network error' }
  }
}
