const STORAGE_KEY = 'im_payment_providers'

const DEFAULT_PROVIDERS = {
  paymongo: {
    id: 'paymongo',
    name: 'PayMongo',
    description: 'GCash, Maya, GrabPay, and Credit/Debit Card via PayMongo',
    enabled: false,
    keys: { publicKey: '', secretKey: '' },
    methods: [
      { id: 'paymongo-gcash', label: 'GCash', desc: 'Pay securely via GCash mobile wallet', icon: '📱' },
      { id: 'paymongo-maya', label: 'Maya', desc: 'Pay via Maya (PayMaya)', icon: '💜' },
      { id: 'paymongo-card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, or JCB', icon: '💳' },
      { id: 'paymongo-grabpay', label: 'GrabPay', desc: 'Pay via GrabPay wallet', icon: '🟢' },
    ],
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    description: 'International credit/debit cards, Apple Pay, Google Pay',
    enabled: false,
    keys: { publishableKey: '', secretKey: '' },
    methods: [
      { id: 'stripe-card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, AMEX via Stripe', icon: '💳' },
      { id: 'stripe-apple', label: 'Apple Pay', desc: 'Quick checkout with Apple Pay', icon: '🍎' },
      { id: 'stripe-google', label: 'Google Pay', desc: 'Quick checkout with Google Pay', icon: '🔵' },
    ],
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    description: 'PayPal wallet and card payments worldwide',
    enabled: false,
    keys: { clientId: '', clientSecret: '', mode: 'sandbox' },
    methods: [
      { id: 'paypal-wallet', label: 'PayPal', desc: 'Pay with your PayPal account', icon: '🅿️' },
      { id: 'paypal-card', label: 'PayPal Card', desc: 'Credit/Debit card via PayPal', icon: '💳' },
    ],
  },
  maya: {
    id: 'maya',
    name: 'Maya (Direct)',
    description: 'Direct Maya/PayMaya API integration',
    enabled: false,
    keys: { publicKey: '', secretKey: '', merchantId: '' },
    methods: [
      { id: 'maya-wallet', label: 'Maya Wallet', desc: 'Pay via Maya wallet QR', icon: '💜' },
      { id: 'maya-qr', label: 'Maya QR', desc: 'Scan QR to pay with Maya', icon: '📷' },
    ],
  },
  gcash: {
    id: 'gcash',
    name: 'GCash (Direct)',
    description: 'Direct GCash API integration',
    enabled: false,
    keys: { publicKey: '', secretKey: '', merchantId: '' },
    methods: [
      { id: 'gcash-wallet', label: 'GCash', desc: 'Pay via GCash mobile wallet', icon: '📱' },
      { id: 'gcash-qr', label: 'GCash QR', desc: 'Scan QR to pay with GCash', icon: '📷' },
    ],
  },
}

function loadProviders() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { ...DEFAULT_PROVIDERS, ...stored }
  } catch {
    return { ...DEFAULT_PROVIDERS }
  }
}

function saveProviders(providers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(providers))
}

export function getPaymentProviders() {
  return loadProviders()
}

export function getPaymentProvider(id) {
  return loadProviders()[id] || null
}

export function isPaymentProviderConfigured(id) {
  const provider = loadProviders()[id]
  if (!provider || !provider.enabled) return false
  const keys = provider.keys
  return Object.values(keys).some(v => v && v.trim() !== '')
}

export function isPaymentMethodAvailable(methodId) {
  const providers = loadProviders()
  for (const provider of Object.values(providers)) {
    if (!provider.enabled) continue
    if (!isPaymentProviderConfigured(provider.id)) continue
    if (provider.methods.some(m => m.id === methodId)) return true
  }
  return false
}

export function getEnabledPaymentMethods() {
  const providers = loadProviders()
  const methods = []
  for (const provider of Object.values(providers)) {
    if (!provider.enabled) continue
    if (!isPaymentProviderConfigured(provider.id)) continue
    for (const method of provider.methods) {
      methods.push({ ...method, provider: provider.id })
    }
  }
  return methods
}

export function updatePaymentProvider(id, updates) {
  const providers = loadProviders()
  if (!providers[id]) return false
  providers[id] = { ...providers[id], ...updates }
  saveProviders(providers)
  return true
}

export function setPaymentProviderKeys(id, keys) {
  const providers = loadProviders()
  if (!providers[id]) return false
  providers[id].keys = { ...providers[id].keys, ...keys }
  saveProviders(providers)
  return true
}

export function togglePaymentProvider(id) {
  const providers = loadProviders()
  if (!providers[id]) return false
  providers[id].enabled = !providers[id].enabled
  saveProviders(providers)
  return providers[id].enabled
}
