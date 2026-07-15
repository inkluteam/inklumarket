import { getPaymentProvider } from './paymentProviders'

function getPayPalConfig() {
  return getPaymentProvider('paypal')?.keys || {}
}

export function isPayPalConfigured() {
  const config = getPayPalConfig()
  return !!(config.clientId && config.clientSecret)
}

export function getPayPalMode() {
  return getPayPalConfig().mode || 'sandbox'
}

export function getPayPalClientId() {
  return getPayPalConfig().clientId || ''
}

function getApiBase() {
  return getPayPalMode() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getAccessToken() {
  const config = getPayPalConfig()
  if (!config.clientId || !config.clientSecret) return null

  try {
    const res = await fetch(`${getApiBase()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!res.ok) return null
    const data = await res.json()
    return data.access_token
  } catch {
    return null
  }
}

export async function createPayPalOrder({ amount, currency, email, name, orderId, items }) {
  const token = await getAccessToken()
  if (!token) return { success: false, error: 'PayPal credentials not configured. Set them in Admin Settings > Payments.' }

  try {
    const orderItems = items.map(item => ({
      name: item.name,
      description: item.description || item.name,
      unit_amount: { currency_code: currency || 'USD', value: item.price.toFixed(2) },
      quantity: String(item.quantity || 1),
      category: 'DIGITAL_GOODS',
    }))

    const res = await fetch(`${getApiBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'PayPal-Request-Id': `im_${orderId}_${Date.now()}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId,
          description: `Inclusive Market Order #${orderId}`,
          amount: {
            currency_code: currency || 'USD',
            value: amount.toFixed(2),
            breakdown: { item_total: { currency_code: currency || 'USD', value: amount.toFixed(2) } },
          },
          items: orderItems,
          payee: { email_address: email },
        }],
        application_context: {
          brand_name: 'Inclusive Market',
          landing_page: 'BILLING',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${window.location.origin}/buyer/orders?payment=success&order=${orderId}`,
          cancel_url: `${window.location.origin}/buyer/orders?payment=failed&order=${orderId}`,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message || 'PayPal order creation failed' }
    }

    const order = await res.json()
    const approveLink = order.links?.find(l => l.rel === 'approve')
    return { success: true, orderId: order.id, approveUrl: approveLink?.href }
  } catch (err) {
    return { success: false, error: err.message || 'Network error creating PayPal order' }
  }
}

export async function capturePayPalOrder(paypalOrderId) {
  const token = await getAccessToken()
  if (!token) return { success: false, error: 'PayPal credentials not configured.' }

  try {
    const res = await fetch(`${getApiBase()}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message || 'PayPal capture failed' }
    }

    const result = await res.json()
    return { success: true, status: result.status, captureId: result.purchase_units?.[0]?.payments?.captures?.[0]?.id }
  } catch (err) {
    return { success: false, error: err.message || 'Network error capturing PayPal payment' }
  }
}

export async function getPayPalOrderDetails(paypalOrderId) {
  const token = await getAccessToken()
  if (!token) return { success: false, error: 'PayPal credentials not configured.' }

  try {
    const res = await fetch(`${getApiBase()}/v2/checkout/orders/${paypalOrderId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message || 'Failed to retrieve PayPal order' }
    }

    const order = await res.json()
    return { success: true, order }
  } catch (err) {
    return { success: false, error: err.message || 'Network error' }
  }
}
