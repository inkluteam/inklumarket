const GMAIL_CONFIG = {
  clientId: import.meta.env.VITE_GMAIL_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GMAIL_CLIENT_SECRET || '',
  refreshToken: import.meta.env.VITE_GMAIL_REFRESH_TOKEN || '',
  fromEmail: import.meta.env.VITE_GMAIL_FROM_EMAIL || 'inklusivemarket@gmail.com',
  fromName: 'Inclusive Market',
}

let cachedAccessToken = null
let tokenExpiresAt = 0

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) return cachedAccessToken

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_CONFIG.clientId,
      client_secret: GMAIL_CONFIG.clientSecret,
      refresh_token: GMAIL_CONFIG.refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) throw new Error('Failed to refresh Gmail access token')
  const data = await res.json()
  cachedAccessToken = data.access_token
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000
  return cachedAccessToken
}

function buildMimeMessage(to, subject, htmlBody) {
  const boundary = 'boundary_' + Math.random().toString(36).slice(2)
  const from = `${GMAIL_CONFIG.fromName} <${GMAIL_CONFIG.fromEmail}>`

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    stripHtml(htmlBody),
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    htmlBody,
    ``,
    `--${boundary}--`,
  ].join('\r\n')
}

function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function sendOrderConfirmationEmail(order, buyerEmail, sellerEmail, buyerName, sellerName) {
  try {
    const accessToken = await getAccessToken()

    const buyerSubject = `Order Confirmed #${order.id} — Thank you, ${buyerName}!`
    const buyerHtml = buildBuyerEmailHtml(order, buyerName)

    const sellerSubject = `New Order #${order.id} — ${buyerName} purchased from ${sellerName}`
    const sellerHtml = buildSellerEmailHtml(order, buyerName, sellerName)

    const sendOne = async (to, subject, html) => {
      const raw = buildMimeMessage(to, subject, html)
      const encodedMessage = base64UrlEncode(raw)

      const res = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedMessage }),
        }
      )
      if (!res.ok) {
        const err = await res.json()
        console.error('Gmail send error:', err)
        return false
      }
      return true
    }

    const buyerResult = await sendOne(buyerEmail, buyerSubject, buyerHtml)
    const sellerResult = await sendOne(sellerEmail, sellerSubject, sellerHtml)

    return { buyerEmail: buyerResult, sellerEmail: sellerResult }
  } catch (err) {
    console.error('Failed to send order emails:', err)
    return { buyerEmail: false, sellerEmail: false, error: err.message }
  }
}

function buildBuyerEmailHtml(order, buyerName) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;">${item.name}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${item.qty}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">₱${item.price.toFixed(2)}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600;">₱${(item.price * item.qty).toFixed(2)}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:linear-gradient(135deg,#2563eb,#059669);padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">♿ Inclusive Market</h1>
      <p style="color:#d1fae5;margin:8px 0 0;font-size:14px;">Order Confirmation</p>
    </div>
    <div style="padding:30px;">
      <h2 style="color:#1f2937;margin:0 0 8px;">Thank you for your order, ${buyerName}!</h2>
      <p style="color:#6b7280;margin:0 0 20px;">Order <strong>#${order.id}</strong> has been placed successfully.</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:12px;text-align:left;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280;text-transform:uppercase;">Product</th>
            <th style="padding:12px;text-align:center;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280;text-transform:uppercase;">Qty</th>
            <th style="padding:12px;text-align:right;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280;text-transform:uppercase;">Price</th>
            <th style="padding:12px;text-align:right;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280;text-transform:uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:20px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#6b7280;">Shipping Address</span>
          <span style="font-weight:600;color:#1f2937;">${order.shippingAddress}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#6b7280;">Payment Method</span>
          <span style="font-weight:600;color:#1f2937;text-transform:capitalize;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'gcash' ? 'GCash' : order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px;">
          <span style="font-weight:700;font-size:16px;">Total</span>
          <span style="font-weight:700;font-size:16px;color:#059669;">₱${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${window.location.origin}/buyer/orders" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View My Orders</a>
      </div>
    </div>
    <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Inclusive Market — Empowering PWD Entrepreneurs</p>
      <p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">AVRC Region IX, Zamboanga Peninsula</p>
    </div>
  </div>
</body>
</html>`
}

function buildSellerEmailHtml(order, buyerName, sellerName) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;">${item.name}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${item.qty}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">₱${item.price.toFixed(2)}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600;">₱${(item.price * item.qty).toFixed(2)}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:linear-gradient(135deg,#2563eb,#059669);padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">♿ Inclusive Market</h1>
      <p style="color:#d1fae5;margin:8px 0 0;font-size:14px;">New Order Received</p>
    </div>
    <div style="padding:30px;">
      <h2 style="color:#1f2937;margin:0 0 8px;">You have a new order, ${sellerName}!</h2>
      <p style="color:#6b7280;margin:0 0 20px;">Order <strong>#${order.id}</strong> from <strong>${buyerName}</strong> is ready for processing.</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:12px;text-align:left;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280;text-transform:uppercase;">Product</th>
            <th style="padding:12px;text-align:center;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280;text-transform:uppercase;">Qty</th>
            <th style="padding:12px;text-align:right;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280;text-transform:uppercase;">Price</th>
            <th style="padding:12px;text-align:right;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280;text-transform:uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:20px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#6b7280;">Ship To</span>
          <span style="font-weight:600;color:#1f2937;">${order.shippingAddress}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#6b7280;">Payment</span>
          <span style="font-weight:600;color:#1f2937;text-transform:capitalize;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'gcash' ? 'GCash' : order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px;">
          <span style="font-weight:700;font-size:16px;">Order Total</span>
          <span style="font-weight:700;font-size:16px;color:#059669;">₱${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="color:#92400e;font-size:14px;margin:0;"><strong>Action Required:</strong> Please process this order and update the status in your Seller Dashboard.</p>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${window.location.origin}/seller/orders" style="background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Orders</a>
      </div>
    </div>
    <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Inclusive Market — Empowering PWD Entrepreneurs</p>
      <p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">AVRC Region IX, Zamboanga Peninsula</p>
    </div>
  </div>
</body>
</html>`
}

export function isGmailConfigured() {
  return !!(GMAIL_CONFIG.refreshToken && GMAIL_CONFIG.clientId)
}

export function getGmailConfigStatus() {
  return {
    clientId: !!GMAIL_CONFIG.clientId,
    clientSecret: !!GMAIL_CONFIG.clientSecret,
    refreshToken: !!GMAIL_CONFIG.refreshToken,
    fromEmail: GMAIL_CONFIG.fromEmail,
  }
}
