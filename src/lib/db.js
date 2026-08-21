/**
 * src/lib/db.js
 * Data layer — wraps Supabase queries for all im_* tables.
 * Drop-in replacement for DataStore localStorage actions.
 * Returns { data, error } from every function.
 */
import { supabase } from './supabase'

// ── Products ─────────────────────────────────────────────────
export const getProducts = () =>
  supabase.from('im_products').select('*, im_categories(name), im_profiles(name)').order('created_at', { ascending: false })

export const getProduct = (id) =>
  supabase.from('im_products').select('*, im_categories(name), im_product_variants(*), im_product_images(*)').eq('id', id).single()

export const createProduct = (product) =>
  supabase.from('im_products').insert(product).select().single()

export const updateProduct = (id, updates) =>
  supabase.from('im_products').update(updates).eq('id', id).select().single()

export const deleteProduct = (id) =>
  supabase.from('im_products').delete().eq('id', id)

export const getProductsBySeller = (sellerId) =>
  supabase.from('im_products').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false })

export const getApprovedProducts = () =>
  supabase.from('im_products').select('*, im_categories(name)').eq('status', 'approved').order('created_at', { ascending: false })

// ── Categories ───────────────────────────────────────────────
export const getCategories = () =>
  supabase.from('im_categories').select('*').order('name')

export const createCategory = (cat) =>
  supabase.from('im_categories').insert(cat).select().single()

export const updateCategory = (id, updates) =>
  supabase.from('im_categories').update(updates).eq('id', id).select().single()

export const deleteCategory = (id) =>
  supabase.from('im_categories').delete().eq('id', id)

// ── Profiles ─────────────────────────────────────────────────
export const getProfiles = () =>
  supabase.from('im_profiles').select('*').order('created_at', { ascending: false })

export const getProfileByAuthId = (authUserId) =>
  supabase.from('im_profiles').select('*').eq('auth_user_id', authUserId).single()

export const updateProfileStatus = (id, status) =>
  supabase.from('im_profiles').update({ account_status: status }).eq('id', id)

export const updateProfile = (id, updates) =>
  supabase.from('im_profiles').update(updates).eq('id', id).select().single()

// ── Orders ───────────────────────────────────────────────────
export const getOrders = () =>
  supabase.from('im_orders').select('*, im_order_items(*, im_products(name, im_product_images(url)))').order('created_at', { ascending: false })

export const getOrdersByBuyer = (buyerId) =>
  supabase.from('im_orders').select('*, im_order_items(*)').eq('buyer_id', buyerId).order('created_at', { ascending: false })

export const getOrdersBySeller = (sellerId) =>
  supabase.from('im_orders').select('*, im_order_items(*, im_products!inner(name, seller_id))')
    .eq('im_order_items.im_products.seller_id', sellerId)
    .order('created_at', { ascending: false })

export const createOrder = (order, items) =>
  supabase.rpc('create_order_with_items', { order_data: order, items_data: items })

export const updateOrderStatus = (id, status) =>
  supabase.from('im_orders').update({ order_status: status }).eq('id', id)

// ── Reviews ──────────────────────────────────────────────────
export const getReviewsByProduct = (productId) =>
  supabase.from('im_product_reviews').select('*, im_profiles(name)').eq('product_id', productId).order('created_at', { ascending: false })

export const createReview = (review) =>
  supabase.from('im_product_reviews').insert(review).select().single()

export const moderateReview = (id, moderated) =>
  supabase.from('im_product_reviews').update({ moderated }).eq('id', id)

// ── Payouts ──────────────────────────────────────────────────
export const getPayouts = () =>
  supabase.from('im_payouts').select('*, im_profiles(name)').order('created_at', { ascending: false })

export const getPayoutsBySeller = (sellerId) =>
  supabase.from('im_payouts').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false })

export const createPayout = (payout) =>
  supabase.from('im_payouts').insert(payout).select().single()

export const updatePayoutStatus = (id, status) =>
  supabase.from('im_payouts').update({ status }).eq('id', id)

// ── Transactions ─────────────────────────────────────────────
export const getTransactions = () =>
  supabase.from('im_transactions').select('*').order('created_at', { ascending: false })

// ── Conversations & Messages ─────────────────────────────────
export const getConversations = (userId) =>
  supabase.from('im_conversations').select('*, im_products(name)').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`).order('last_message_at', { ascending: false })

export const getOrCreateConversation = async (buyerId, sellerId, productId) => {
  const { data: existing } = await supabase
    .from('im_conversations')
    .select('*')
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .eq('product_id', productId)
    .maybeSingle()
  if (existing) return { data: existing, error: null }
  return supabase.from('im_conversations').insert({ buyer_id: buyerId, seller_id: sellerId, product_id: productId }).select().single()
}

export const getMessages = (conversationId) =>
  supabase.from('im_messages').select('*, im_profiles(name)').eq('conversation_id', conversationId).order('created_at')

export const sendMessage = async (conversationId, senderId, body) => {
  const { data, error } = await supabase.from('im_messages').insert({ conversation_id: conversationId, sender_id: senderId, body }).select().single()
  if (!error) await supabase.from('im_conversations').update({ last_message: body, last_message_at: new Date().toISOString() }).eq('id', conversationId)
  return { data, error }
}

// ── Support Tickets ──────────────────────────────────────────
export const getTickets = () =>
  supabase.from('im_support_tickets').select('*, im_profiles(name), im_ticket_responses(*)').order('created_at', { ascending: false })

export const getTicketsByUser = (userId) =>
  supabase.from('im_support_tickets').select('*, im_ticket_responses(*)').eq('user_id', userId).order('created_at', { ascending: false })

export const createTicket = (ticket) =>
  supabase.from('im_support_tickets').insert(ticket).select().single()

export const updateTicketStatus = (id, status) =>
  supabase.from('im_support_tickets').update({ ticket_status: status }).eq('id', id)

export const addTicketResponse = (response) =>
  supabase.from('im_ticket_responses').insert(response).select().single()

// ── Notifications ────────────────────────────────────────────
export const getNotifications = (userId) =>
  supabase.from('im_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })

export const createNotification = (notif) =>
  supabase.from('im_notifications').insert(notif)

export const markNotificationRead = (id) =>
  supabase.from('im_notifications').update({ is_read: true }).eq('id', id)

export const markAllRead = (userId) =>
  supabase.from('im_notifications').update({ is_read: true }).eq('user_id', userId)

// ── Flash Sales ──────────────────────────────────────────────
export const getFlashSales = () =>
  supabase.from('im_flash_sales').select('*, im_products(name, base_price)').order('starts_at')

export const getActiveFlashSales = () => {
  const now = new Date().toISOString()
  return supabase.from('im_flash_sales').select('*, im_products(name, base_price)').lte('starts_at', now).gte('ends_at', now)
}

export const createFlashSale = (sale) =>
  supabase.from('im_flash_sales').insert(sale).select().single()

export const deleteFlashSale = (id) =>
  supabase.from('im_flash_sales').delete().eq('id', id)

// ── Wishlist ─────────────────────────────────────────────────
export const getWishlist = (userId) =>
  supabase.from('im_wishlist').select('*, im_products(*)').eq('user_id', userId)

export const addToWishlist = (userId, productId) =>
  supabase.from('im_wishlist').insert({ user_id: userId, product_id: productId })

export const removeFromWishlist = (userId, productId) =>
  supabase.from('im_wishlist').delete().eq('user_id', userId).eq('product_id', productId)

// ── Consent Logs ─────────────────────────────────────────────
export const getConsentLogs = () =>
  supabase.from('im_consent_logs').select('*, im_profiles(name)').order('logged_at', { ascending: false })

export const createConsentLog = (log) =>
  supabase.from('im_consent_logs').insert(log)

// ── Newsletter ───────────────────────────────────────────────
export const getNewsletter = () =>
  supabase.from('im_newsletter_subscribers').select('*').order('subscribed_at', { ascending: false })

export const subscribeNewsletter = (email, userId = null) =>
  supabase.from('im_newsletter_subscribers').upsert({ email, user_id: userId, active: true }, { onConflict: 'email' })

export const unsubscribeNewsletter = (email) =>
  supabase.from('im_newsletter_subscribers').update({ active: false }).eq('email', email)

// ── Activity Logs ────────────────────────────────────────────
export const getActivityLogs = () =>
  supabase.from('im_activity_logs').select('*').order('created_at', { ascending: false }).limit(200)

export const createActivityLog = (log) =>
  supabase.from('im_activity_logs').insert(log)

// ── Payment Providers ────────────────────────────────────────
export const getPaymentProviders = () =>
  supabase.from('im_payment_providers').select('*').order('id')

export const updatePaymentProvider = (id, updates) =>
  supabase.from('im_payment_providers').update(updates).eq('id', id)

// ── Theme Settings ───────────────────────────────────────────
export const getThemeSettings = () =>
  supabase.from('im_theme_settings').select('*').limit(1).single()

export const updateThemeSettings = (updates) =>
  supabase.from('im_theme_settings').update(updates).eq('id', 1)

// ── Addresses ────────────────────────────────────────────────
export const getAddresses = (userId) =>
  supabase.from('im_addresses').select('*').eq('user_id', userId)

export const createAddress = (address) =>
  supabase.from('im_addresses').insert(address).select().single()

export const updateAddress = (id, updates) =>
  supabase.from('im_addresses').update(updates).eq('id', id)

export const deleteAddress = (id) =>
  supabase.from('im_addresses').delete().eq('id', id)

// ── Chat Sessions ────────────────────────────────────────────
export const getChatSession = (id) =>
  supabase.from('im_chat_sessions').select('*, im_chat_messages(*)').eq('id', id).single()

export const createChatSession = (session) =>
  supabase.from('im_chat_sessions').insert(session).select().single()

export const addChatMessage = (msg) =>
  supabase.from('im_chat_messages').insert(msg)

export const updateChatSession = (id, updates) =>
  supabase.from('im_chat_sessions').update(updates).eq('id', id)

// ── Cart (server-side, spec FR-04 / migration 0002) ──────────
export const getCart = (userId) =>
  supabase.from('im_cart').select('*, im_products(*), im_product_variants(*)').eq('user_id', userId).order('created_at')

export const addToCart = (userId, productId, variantId = null, quantity = 1) =>
  supabase.from('im_cart').upsert(
    { user_id: userId, product_id: productId, variant_id: variantId, quantity },
    { onConflict: 'user_id,product_id,variant_id' }
  )

export const updateCartQuantity = (id, quantity) =>
  supabase.from('im_cart').update({ quantity }).eq('id', id)

export const removeFromCart = (id) =>
  supabase.from('im_cart').delete().eq('id', id)

export const clearCart = (userId) =>
  supabase.from('im_cart').delete().eq('user_id', userId)

// ── Order Status History (spec FR-05 / migration 0002) ───────
export const getOrderHistory = (orderId) =>
  supabase.from('im_order_status_history').select('*').eq('order_id', orderId).order('created_at')

// ── UI Accessibility Prefs (spec FR-14 / im_ui_prefs) ────────
export const getUiPrefs = (userId) =>
  supabase.from('im_ui_prefs').select('*').eq('user_id', userId).maybeSingle()

export const saveUiPrefs = (userId, prefs) =>
  supabase.from('im_ui_prefs').upsert({ user_id: userId, ...prefs }, { onConflict: 'user_id' }).select().single()

// ── Audit Logs (spec NFR-08 / im_audit_logs) ─────────────────
export const getAuditLogs = () =>
  supabase.from('im_audit_logs').select('*, im_profiles(name)').order('created_at', { ascending: false }).limit(200)

export const createAuditLog = (log) =>
  supabase.from('im_audit_logs').insert(log)

// ── Low Stock Alerts (view, spec §4.3) ───────────────────────
export const getLowStockAlerts = () =>
  supabase.from('im_low_stock_alerts').select('*')
