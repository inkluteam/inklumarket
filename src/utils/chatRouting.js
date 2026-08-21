// SmartChat concern routing — keyword-scored intent classifier with canned answers.
export const INTENTS = [
  {
    id: 'order',
    label: 'Order & Delivery',
    route: 'order-queue',
    keywords: ['order', 'track', 'delivery', 'deliver', 'shipping', 'arrive', 'package', 'parcel', 'courier', 'rider', 'where is my'],
    answer: 'You can track every order under Account → My Orders → View. Statuses move from pending → processing → shipped → delivered. If your order is late by more than 3 days past ETA, I can escalate this to our support team.'
  },
  {
    id: 'payment',
    label: 'Payment',
    route: 'payment-queue',
    keywords: ['payment', 'pay', 'gcash', 'maya', 'cod', 'cash on delivery', 'charged', 'receipt', 'double charged', 'refund status'],
    answer: 'We accept Maya, GCash, bank transfer and Cash on Delivery. If you were charged twice or paid but the order shows unpaid, do not worry — send me the details and I will escalate to the payments team for verification.'
  },
  {
    id: 'refund',
    label: 'Refund & Return',
    route: 'refund-queue',
    keywords: ['refund', 'return', 'broken', 'damaged', 'wrong item', 'missing item', 'cancel my order', 'money back', 'defect'],
    answer: 'For returns: go to your order, tap "Return / Refund" within 7 days of delivery and include a photo if the item is damaged. Sellers respond in 48h; unresolved cases go to admin mediation. Want me to start a ticket now?'
  },
  {
    id: 'product',
    label: 'Product Question',
    route: 'product-queue',
    keywords: ['product', 'item', 'stock', 'available', 'size', 'color', 'variant', 'price', 'discount', 'voucher', 'coupon'],
    answer: 'Product details, sizes and colors are on each product page. Out-of-stock items show "Only available" toggles in catalog filters. Vouchers apply at checkout — try a code in the payment step!'
  },
  {
    id: 'seller',
    label: 'Selling on IncluMarket',
    route: 'seller-queue',
    keywords: ['sell', 'seller', 'shop owner', 'payout', 'storefront', 'onboarding', 'become a seller', 'commission', 'fee'],
    answer: 'Anyone can sell! Apply via Become a Seller — admins verify PWD/artisan credentials, then you get a storefront, order dashboard and payouts. Platform fee is 5% per sale.'
  },
  {
    id: 'account',
    label: 'Account & Accessibility',
    route: 'account-queue',
    keywords: ['account', 'password', 'login', 'sign up', 'register', 'blocked', 'suspended', 'accessibility', 'screen reader', 'low data', 'language'],
    answer: 'Account settings live under your profile menu. Forgot password uses email reset. For accessibility, open the toolbar (top-left): font size, contrast, reduced motion, text-to-speech and low-data mode. Suspended accounts must contact admin.'
  }
]

const HUMAN_WORDS = ['human', 'agent', 'real person', 'admin', 'staff', 'talk to someone', 'escalate', 'complaint', 'report seller']

export function classify(text) {
  const t = String(text || '').toLowerCase()
  if (HUMAN_WORDS.some(w => t.includes(w))) {
    return { intent: null, confidence: 1, human: true, route: 'support-ticket' }
  }
  let best = null, bestScore = 0
  INTENTS.forEach(intent => {
    const score = intent.keywords.reduce((s, k) => s + (t.includes(k) ? k.length : 0), 0)
    if (score > bestScore) { bestScore = score; best = intent }
  })
  if (!best || bestScore < 4) {
    return { intent: null, confidence: bestScore ? bestScore / 10 : 0, human: false, route: 'general' }
  }
  return { intent: best, confidence: Math.min(1, bestScore / 12), human: false, route: best.route }
}

export function reply(text) {
  const c = classify(text)
  if (c.human) {
    return {
      body: 'Of course — I can connect you with a human teammate. Tap "Escalate to Support Ticket" below and we will reply by email and in your Notifications, usually within 24 hours.',
      route: c.route, escalate: true
    }
  }
  if (c.intent && c.confidence >= 0.5) {
    return {
      body: c.intent.answer,
      route: c.intent.label,
      escalate: false,
      followUp: 'Did that answer your question? If not, tap "Escalate to Support Ticket" and a person will take over.'
    }
  }
  return {
    body: "I want to make sure you get the right help. I can answer questions about orders, payments, refunds, products, selling or accessibility — or tap \"Escalate to Support Ticket\" and our team will personally assist you.",
    route: 'general', escalate: true
  }
}
