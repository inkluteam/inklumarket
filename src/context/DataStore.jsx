import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { categories as initCategories, sellers as initSellers, products as initProducts, users as initUsers, orders as initOrders, reviews as initReviews, activityLogs as initLogs, payouts as initPayouts, transactions as initTransactions, conversations as initConversations, supportTickets as initTickets, notifications as initNotifications, flashSales as initFlashSales, wishlist as initWishlist, consentLogs as initConsentLogs, newsletter as initNewsletter, chatSessions as initChatSessions } from '../data/mockData'

const DataStoreContext = createContext(null)

export function DataStoreProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('im_products')
    return saved ? JSON.parse(saved) : initProducts
  })
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('im_orders')
    return saved ? JSON.parse(saved) : initOrders
  })
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('im_users')
    return saved ? JSON.parse(saved) : initUsers
  })
  const [sellers, setSellers] = useState(() => {
    const saved = localStorage.getItem('im_sellers')
    return saved ? JSON.parse(saved) : initSellers
  })
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('im_categories')
    return saved ? JSON.parse(saved) : initCategories
  })
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('im_reviews')
    return saved ? JSON.parse(saved) : initReviews
  })
  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('im_activity_logs')
    return saved ? JSON.parse(saved) : initLogs
  })
  const [payouts, setPayouts] = useState(() => {
    const saved = localStorage.getItem('im_payouts')
    return saved ? JSON.parse(saved) : initPayouts
  })
  const [transactions] = useState(() => {
    const saved = localStorage.getItem('im_transactions')
    return saved ? JSON.parse(saved) : initTransactions
  })
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('im_messages')
    return saved ? JSON.parse(saved) : []
  })
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('im_addresses')
    return saved ? JSON.parse(saved) : []
  })
  const [refunds, setRefunds] = useState(() => {
    const saved = localStorage.getItem('im_refunds')
    return saved ? JSON.parse(saved) : []
  })
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('im_conversations')
    return saved ? JSON.parse(saved) : initConversations
  })
  const [supportTickets, setSupportTickets] = useState(() => {
    const saved = localStorage.getItem('im_support_tickets')
    return saved ? JSON.parse(saved) : initTickets
  })
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('im_notifications')
    return saved ? JSON.parse(saved) : initNotifications
  })
  const [flashSales, setFlashSales] = useState(() => {
    const saved = localStorage.getItem('im_flash_sales')
    return saved ? JSON.parse(saved) : initFlashSales
  })
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('im_wishlist')
    return saved ? JSON.parse(saved) : initWishlist
  })
  const [consentLogs, setConsentLogs] = useState(() => {
    const saved = localStorage.getItem('im_consent_logs')
    return saved ? JSON.parse(saved) : initConsentLogs
  })
  const [newsletter, setNewsletter] = useState(() => {
    const saved = localStorage.getItem('im_newsletter')
    return saved ? JSON.parse(saved) : initNewsletter
  })
  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem('im_chat_sessions')
    return saved ? JSON.parse(saved) : initChatSessions
  })
  const [paymentProviders, setPaymentProviders] = useState(() => {
    const saved = localStorage.getItem('im_payment_providers')
    return saved ? JSON.parse(saved) : [
      { id: 'cod', name: 'Cash on Delivery', enabled: true, fee: 0 },
      { id: 'gcash', name: 'GCash', enabled: true, fee: 1.5 },
      { id: 'maya', name: 'Maya (PayMaya)', enabled: true, fee: 1.5 },
      { id: 'paymongo', name: 'PayMongo', enabled: false, fee: 2.5 },
      { id: 'stripe', name: 'Stripe', enabled: false, fee: 2.9 },
      { id: 'paypal', name: 'PayPal', enabled: false, fee: 3.0 },
    ]
  })
  const [themeSettings, setThemeSettings] = useState(() => {
    const saved = localStorage.getItem('im_theme_settings')
    return saved ? JSON.parse(saved) : {
      colorPrimary: '#0047AB',
      colorSecondary: '#C8102E',
      colorAccent: '#FFD700',
      colorBackground: '#FFFFFF',
      colorText: '#1a1a1a',
      fontSizeBase: 16,
      borderRadius: 8,
      preset: 'dswd-default',
    }
  })

  const persist = (key, data) => localStorage.setItem(key, JSON.stringify(data))

  const addActivityLog = useCallback((action, user, type, details, amount = null) => {
    let newLog = null
    setActivityLogs(prev => {
      const refNo = 'AUD-' + String(1000 + prev.length + 1)
      newLog = { id: 'a' + Date.now(), action, user, type, details, amount, refNo, ts: new Date().toISOString(), time: new Date().toLocaleString('en-PH'), icon: type === 'user' ? 'User' : type === 'product' ? 'Package' : type === 'order' ? 'ShoppingCart' : 'Settings' }
      const next = [newLog, ...prev]
      persist('im_activity_logs', next)
      return next
    })
  }, [])

  const addProduct = useCallback((product) => {
    const newProduct = { ...product, id: String(Date.now()), rating: 0, reviews: 0, status: 'pending_review', dateAdded: new Date().toISOString().split('T')[0] }
    setProducts(prev => {
      const next = [...prev, newProduct]
      persist('im_products', next)
      return next
    })
    addActivityLog('Product listed', product.seller || 'Seller', 'product', `${product.name} submitted for review`)
    return newProduct
  }, [addActivityLog])

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => {
      const next = prev.map(p => {
        if (p.id !== id) return p
        const substantiveFields = ['name', 'description', 'price', 'category']
        const isSubstantive = p.status === 'approved' && substantiveFields.some(f => updates[f] !== undefined && updates[f] !== p[f])
        return { ...p, ...updates, status: isSubstantive ? 'pending_review' : (updates.status || p.status) }
      })
      persist('im_products', next)
      return next
    })
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id)
      persist('im_products', next)
      return next
    })
    addActivityLog('Product removed', 'Admin', 'product', 'Product listing removed')
  }, [addActivityLog])

  const addOrder = useCallback((order) => {
    const newOrder = { ...order, id: 'ORD-' + Date.now().toString().slice(-6), date: new Date().toISOString().split('T')[0] }
    setOrders(prev => {
      const next = [newOrder, ...prev]
      persist('im_orders', next)
      return next
    })
    addActivityLog('Order placed', order.buyer || 'Buyer', 'order', `${newOrder.id} Â· ${String(order.paymentMethod || 'cod').toUpperCase()}`, Number(order.total) || 0)
    const sellerUserIds = [...new Set((order.items || []).map(it => products.find(p => p.id === it.productId)?.sellerId).filter(Boolean))]
      .map(sid => users.find(u => u.sellerId === sid)?.id).filter(Boolean)
    sellerUserIds.forEach(uid => addNotification(uid, 'order', `New order ${newOrder.id} â€” please prepare for processing`, '/seller/seller-orders'))
    return newOrder
  }, [addActivityLog, products, users, addNotification])

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev => {
      const next = prev.map(o => o.id === orderId ? { ...o, status } : o)
      persist('im_orders', next)
      return next
    })
    const o = orders.find(x => x.id === orderId)
    if (o?.buyerId) addNotification(o.buyerId, 'order', `Your order ${orderId} is now "${status}"`, '/notifications')
    const FIN_STATUSES = ['paid', 'completed', 'delivered', 'refunded', 'cancelled']
    if (o && FIN_STATUSES.includes(status)) {
      addActivityLog(`Order ${status}`, 'Admin', 'order', `${orderId} Â· ${o.buyer || ''} (${status})`, status === 'refunded' || status === 'cancelled' ? -Math.abs(Number(o.total) || 0) : Math.abs(Number(o.total) || 0))
    } else {
      addActivityLog('Order updated', 'System', 'order', `${orderId} marked as ${status}`)
    }
  }, [addActivityLog, orders, addNotification])

  const bulkUpdateOrderStatus = useCallback((orderIds, status) => {
    setOrders(prev => {
      const idSet = new Set(orderIds)
      const next = prev.map(o => idSet.has(o.id) ? { ...o, status } : o)
      persist('im_orders', next)
      return next
    })
    addActivityLog('Bulk order update', 'System', 'order', `${orderIds.length} order(s) marked as ${status}`)
  }, [addActivityLog])

  const addMessage = useCallback((message) => {
    const newMessage = {
      ...message,
      id: 'msg-' + Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
    }
    setMessages(prev => {
      const next = [newMessage, ...prev]
      persist('im_messages', next)
      return next
    })
    return newMessage
  }, [])

  const getMessagesByOrder = useCallback((orderId) => {
    return messages.filter(m => m.orderId === orderId).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }, [messages])

  const markMessagesRead = useCallback((orderId, userId) => {
    setMessages(prev => {
      const next = prev.map(m => m.orderId === orderId && m.senderId !== userId ? { ...m, read: true } : m)
      persist('im_messages', next)
      return next
    })
  }, [])

  const updateUserStatus = useCallback((userId, status, reason = '') => {
    setUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, status, banReason: status === 'suspended' ? (reason || 'Policy violation') : null } : u)
      persist('im_users', next)
      return next
    })
    addActivityLog(status === 'active' ? 'User activated' : 'User suspended', 'Admin', 'user', `Account ${status}${reason ? ` · reason: ${reason}` : ''}`)
  }, [addActivityLog])

  const updateSellerStatus = useCallback((sellerId, status) => {
    setSellers(prev => {
      const next = prev.map(s => s.id === sellerId ? { ...s, status, verified: status === 'active' } : s)
      persist('im_sellers', next)
      return next
    })
    addActivityLog(status === 'active' ? 'Seller approved' : 'Seller rejected', 'Admin', 'user', `Seller application ${status}`)
  }, [addActivityLog])

  const addCategory = useCallback((category) => {
    const newCat = { ...category, id: String(Date.now()), productCount: 0 }
    setCategories(prev => {
      const next = [...prev, newCat]
      persist('im_categories', next)
      return next
    })
    addActivityLog('Category added', 'Admin', 'product', `${category.name} created`)
    return newCat
  }, [addActivityLog])

  const updateCategory = useCallback((id, updates) => {
    setCategories(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c)
      persist('im_categories', next)
      return next
    })
  }, [])

  const deleteCategory = useCallback((id) => {
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id)
      persist('im_categories', next)
      return next
    })
  }, [])

  const addSeller = useCallback((seller) => {
    const newSeller = { ...seller, id: 's' + Date.now(), status: 'pending', rating: 0, totalSales: 0, verified: false, joined: new Date().toISOString().split('T')[0] }
    setSellers(prev => {
      const next = [...prev, newSeller]
      persist('im_sellers', next)
      return next
    })
    addActivityLog('New seller registered', seller.name, 'user', 'Seller account activated')
    return newSeller
  }, [addActivityLog])

  const addReview = useCallback((review) => {
    const newReview = { ...review, id: 'r' + Date.now(), date: new Date().toISOString().split('T')[0] }
    setReviews(prev => {
      const next = [newReview, ...prev]
      persist('im_reviews', next)
      return next
    })
  }, [])

  const addPayout = useCallback((payout) => {
    const newPayout = { ...payout, id: 'PAY-' + String(Date.now()).slice(-6), date: new Date().toISOString().split('T')[0], status: 'pending' }
    setPayouts(prev => {
      const next = [newPayout, ...prev]
      persist('im_payouts', next)
      return next
    })
    addActivityLog('Payout requested', payout.sellerName || 'Seller', 'order', `Payout of ${payout.amount} requested via ${payout.method}`)
    return newPayout
  }, [addActivityLog])

  const updateUser = useCallback((userId, updates) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, ...updates } : u)
      persist('im_users', next)
      return next
    })
  }, [])

  const getProductReviews = useCallback((productId) => {
    return reviews.filter(r => r.productId === productId)
  }, [reviews])

  const getSellerProducts = useCallback((sellerId) => {
    return products.filter(p => p.sellerId === sellerId)
  }, [products])

  const getOrdersByBuyer = useCallback((buyerId) => {
    return orders.filter(o => o.buyerId === buyerId)
  }, [orders])

  const getOrdersBySeller = useCallback((sellerId) => {
    const sellerProducts = products.filter(p => p.sellerId === sellerId)
    const sellerProductIds = new Set(sellerProducts.map(p => p.id))
    return orders.filter(o => o.items.some(item => sellerProductIds.has(item.productId)))
  }, [orders, products])

  const getTransactionStats = useCallback(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const totalFees = totalRevenue * 0.05
    const totalPayouts = totalRevenue - totalFees
    return { totalRevenue, totalFees, totalPayouts, orderCount: orders.length, userCount: users.length, productCount: products.length }
  }, [orders, users, products])

  const getSmartRecommendations = useCallback((productId, limit = 4) => {
    const product = products.find(p => p.id === productId)
    if (!product) return []
    const scored = products
      .filter(p => p.id !== productId)
      .map(p => {
        let score = 0
        if (p.category === product.category) score += 40
        if (p.seller === product.seller) score += 15
        const priceDiff = Math.abs(p.price - product.price) / product.price
        if (priceDiff < 0.2) score += 25
        else if (priceDiff < 0.5) score += 15
        else if (priceDiff < 1.0) score += 5
        if (p.rating >= 4.5) score += 10
        else if (p.rating >= 4.0) score += 5
        if (p.featured) score += 5
        score += Math.min(p.reviews, 10)
        return { ...p, score }
      })
      .sort((a, b) => b.score - a.score)
    const result = []
    const usedCategories = new Set()
    for (const p of scored) {
      if (result.length >= limit) break
      if (result.length >= limit - 1 && usedCategories.has(p.category) && usedCategories.size > 1) continue
      result.push(p)
      usedCategories.add(p.category)
    }
    return result
  }, [products])

  const getLowStockProducts = useCallback(() => {
    return products.filter(p => p.stock <= 10 && p.stock > 0)
  }, [products])

  const getSellerMonthlySales = useCallback((sellerId) => {
    const sellerProducts = products.filter(p => p.sellerId === sellerId)
    const sellerProductIds = new Set(sellerProducts.map(p => p.id))
    const sellerOrders = orders.filter(o => o.items.some(item => sellerProductIds.has(item.productId)))
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    return months.slice(0, 6).map((label, i) => {
      const monthIndex = (now.getMonth() - 5 + i + 12) % 12
      const year = now.getFullYear() - (now.getMonth() - 5 + i < 0 ? 1 : 0)
      const monthOrders = sellerOrders.filter(o => {
        const d = new Date(o.date)
        return d.getMonth() === monthIndex && d.getFullYear() === year
      })
      return { label, value: Math.round(monthOrders.reduce((s, o) => s + o.total, 0)) || Math.round(Math.random() * 500 + 100) }
    })
  }, [products, orders])

  const getSellerProductActivity = useCallback((sellerId) => {
    const sellerProducts = products.filter(p => p.sellerId === sellerId)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    return months.slice(0, 6).map((label, i) => {
      const monthIndex = (now.getMonth() - 5 + i + 12) % 12
      const year = now.getFullYear() - (now.getMonth() - 5 + i < 0 ? 1 : 0)
      const added = sellerProducts.filter(p => {
        const d = new Date(p.dateAdded)
        return d.getMonth() === monthIndex && d.getFullYear() === year
      }).length
      return { label, value: added || Math.floor(Math.random() * 3 + 1) }
    })
  }, [products])

  const generateSellerReport = useCallback((sellerId) => {
    const sellerProducts = products.filter(p => p.sellerId === sellerId)
    const sellerProductIds = new Set(sellerProducts.map(p => p.id))
    const sellerOrders = orders.filter(o => o.items.some(item => sellerProductIds.has(item.productId)))
    const totalRevenue = sellerOrders.reduce((s, o) => s + o.total, 0)
    const statusBreakdown = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
    sellerOrders.forEach(o => { if (statusBreakdown[o.status] !== undefined) statusBreakdown[o.status]++ })

    const lines = []
    lines.push('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•')
    lines.push('         INCLUSIVE MARKET â€” SALES REPORT')
    lines.push('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•')
    lines.push(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
    lines.push('')
    lines.push('â”€â”€ SUMMARY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€')
    lines.push(`Total Products:    ${sellerProducts.length}`)
    lines.push(`Total Orders:      ${sellerOrders.length}`)
    lines.push(`Total Revenue:     â‚±${totalRevenue.toFixed(2)}`)
    lines.push(`Avg Order Value:   â‚±${sellerOrders.length > 0 ? (totalRevenue / sellerOrders.length).toFixed(2) : '0.00'}`)
    lines.push('')
    lines.push('â”€â”€ ORDER STATUS BREAKDOWN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€')
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      lines.push(`  ${status.charAt(0).toUpperCase() + status.slice(1).padEnd(12)} ${count}`)
    })
    lines.push('')
    lines.push('â”€â”€ PRODUCT LISTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€')
    sellerProducts.forEach((p, i) => {
      lines.push(`  ${i + 1}. ${p.name}`)
      lines.push(`     Price: â‚±${p.price.toFixed(2)}  |  Stock: ${p.stock}  |  Rating: ${p.rating}â˜…  |  Reviews: ${p.reviews}`)
    })
    lines.push('')
    lines.push('â”€â”€ ORDER HISTORY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€')
    sellerOrders.forEach((o, i) => {
      lines.push(`  ${i + 1}. ${o.id} â€” ${o.buyer}`)
      lines.push(`     Date: ${o.date}  |  Total: â‚±${o.total.toFixed(2)}  |  Status: ${o.status}`)
      o.items.forEach(item => {
        lines.push(`     â”” ${item.name} x${item.qty} @ â‚±${item.price.toFixed(2)}`)
      })
    })
    lines.push('')
    lines.push('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•')
    lines.push('        End of Report â€” Inclusive Market')
    lines.push('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•')

    return lines.join('\n')
  }, [products, orders])

  const getTrendingProducts = useCallback((limit = 4) => {
    return [...products]
      .filter(p => p.status === 'approved' && p.stock > 0)
      .sort((a, b) => {
        const scoreA = (a.rating * 20) + (a.reviews * 2) + (a.featured ? 15 : 0)
        const scoreB = (b.rating * 20) + (b.reviews * 2) + (b.featured ? 15 : 0)
        return scoreB - scoreA
      })
      .slice(0, limit)
  }, [products])

  const getNewArrivals = useCallback((limit = 4) => {
    return [...products]
      .filter(p => p.status === 'approved' && p.stock > 0)
      .sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''))
      .slice(0, limit)
  }, [products])

  const smartSearch = useCallback((query, limit = 8) => {
    if (!query || query.trim().length < 1) return []
    const q = query.toLowerCase().trim()
    const terms = q.split(/\s+/)
    return products
      .filter(p => p.status === 'approved')
      .map(p => {
        let score = 0
        const nameLower = p.name.toLowerCase()
        const sellerLower = (p.seller || '').toLowerCase()
        const descLower = (p.description || '').toLowerCase()
        const catLower = (p.category || '').toLowerCase()
        if (nameLower === q) score += 100
        else if (nameLower.startsWith(q)) score += 80
        else if (nameLower.includes(q)) score += 60
        if (sellerLower.includes(q)) score += 40
        if (descLower.includes(q)) score += 20
        if (catLower.includes(q)) score += 30
        for (const term of terms) {
          if (nameLower.includes(term)) score += 15
          if (descLower.includes(term)) score += 5
        }
        if (p.featured) score += 5
        if (p.rating >= 4.5) score += 3
        return { ...p, score }
      })
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }, [products])

  const getSmartAlerts = useCallback(() => {
    const alerts = []
    const lowStock = products.filter(p => p.stock <= 10 && p.stock > 0)
    const outOfStock = products.filter(p => p.stock === 0)
    const pendingOrders = orders.filter(o => o.status === 'pending')
    const pendingSellers = sellers.filter(s => s.status === 'pending')
    const suspendedUsers = users.filter(u => u.status === 'suspended')
    const avgRating = products.length > 0 ? products.reduce((s, p) => s + p.rating, 0) / products.length : 0
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
    if (lowStock.length > 0) alerts.push({ type: 'warning', title: 'Low Stock', message: `${lowStock.length} product(s) running low: ${lowStock.map(p => p.name).join(', ')}`, icon: 'AlertTriangle' })
    if (outOfStock.length > 0) alerts.push({ type: 'danger', title: 'Out of Stock', message: `${outOfStock.length} product(s) are out of stock`, icon: 'AlertTriangle' })
    if (pendingOrders.length > 0) alerts.push({ type: 'info', title: 'Pending Orders', message: `${pendingOrders.length} order(s) awaiting processing`, icon: 'ShoppingCart' })
    if (pendingSellers.length > 0) alerts.push({ type: 'info', title: 'Seller Applications', message: `${pendingSellers.length} seller application(s) pending review`, icon: 'User' })
    if (suspendedUsers.length > 0) alerts.push({ type: 'danger', title: 'Suspended Users', message: `${suspendedUsers.length} user(s) currently suspended`, icon: 'AlertTriangle' })
    if (totalRevenue > 10000) alerts.push({ type: 'success', title: 'Revenue Milestone', message: `Platform revenue has exceeded â‚±10,000`, icon: 'TrendingUp' })
    if (avgRating >= 4.5) alerts.push({ type: 'success', title: 'High Satisfaction', message: `Average product rating is ${avgRating.toFixed(1)}/5 stars`, icon: 'Star' })
    if (alerts.length === 0) alerts.push({ type: 'success', title: 'All Systems Operational', message: 'No issues detected', icon: 'CheckCircle' })
    return alerts
  }, [products, orders, sellers, users])

  const addAddress = useCallback((userId, address) => {
    const newAddr = { ...address, id: 'addr-' + Date.now(), userId }
    setAddresses(prev => {
      let next = [...prev, newAddr]
      if (address.isDefault) {
        next = next.map(a => a.userId === userId && a.id !== newAddr.id ? { ...a, isDefault: false } : a)
      }
      persist('im_addresses', next)
      return next
    })
    return newAddr
  }, [])

  const updateAddress = useCallback((userId, addressId, updates) => {
    setAddresses(prev => {
      let next = prev.map(a => a.id === addressId ? { ...a, ...updates } : a)
      if (updates.isDefault) {
        next = next.map(a => a.userId === userId && a.id !== addressId ? { ...a, isDefault: false } : a)
      }
      persist('im_addresses', next)
      return next
    })
  }, [])

  const deleteAddress = useCallback((addressId) => {
    setAddresses(prev => {
      const next = prev.filter(a => a.id !== addressId)
      persist('im_addresses', next)
      return next
    })
  }, [])

  const setDefaultAddress = useCallback((userId, addressId) => {
    setAddresses(prev => {
      const next = prev.map(a => a.userId === userId ? { ...a, isDefault: a.id === addressId } : a)
      persist('im_addresses', next)
      return next
    })
  }, [])

  const getAddressesByUser = useCallback((userId) => {
    return addresses.filter(a => a.userId === userId)
  }, [addresses])

  const requestRefund = useCallback((refund) => {
    const newRefund = { ...refund, id: 'REF-' + Date.now().toString().slice(-6), status: 'pending', createdAt: new Date().toISOString() }
    setRefunds(prev => {
      const next = [newRefund, ...prev]
      persist('im_refunds', next)
      return next
    })
    addActivityLog('Refund requested', refund.buyerName || 'Buyer', 'order', `Refund of â‚±${refund.amount.toFixed(2)} for ${refund.orderId}`)
    return newRefund
  }, [addActivityLog])

  const updateRefundStatus = useCallback((refundId, status, adminNote = '') => {
    setRefunds(prev => {
      const next = prev.map(r => r.id === refundId ? { ...r, status, adminNote, resolvedAt: new Date().toISOString() } : r)
      persist('im_refunds', next)
      return next
    })
    addActivityLog(`Refund ${status}`, 'Admin', 'order', `Refund ${refundId} ${status}`)
  }, [addActivityLog])

  const getRefundsByOrder = useCallback((orderId) => {
    return refunds.filter(r => r.orderId === orderId)
  }, [refunds])

  const moderateReview = useCallback((reviewId, action) => {
    setReviews(prev => {
      const next = prev.map(r => r.id === reviewId ? { ...r, moderated: action === 'hide' ? true : false, flagged: action === 'flag' ? true : false } : r)
      persist('im_reviews', next)
      return next
    })
    addActivityLog('Review moderated', 'Admin', 'user', `Review ${reviewId} ${action}`)
  }, [addActivityLog])

  // â”€â”€ Conversations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getOrCreateConversation = useCallback((buyerId, sellerId, productId = null) => {
    const existing = conversations.find(c => c.buyerId === buyerId && c.sellerId === sellerId && (productId ? c.productId === productId : true))
    if (existing) return existing
    const newConv = { id: 'conv-' + Date.now(), buyerId, sellerId, productId, createdAt: new Date().toISOString(), lastMessage: null, lastMessageAt: null }
    setConversations(prev => { const next = [newConv, ...prev]; persist('im_conversations', next); return next })
    return newConv
  }, [conversations])

  const sendConversationMessage = useCallback((conversationId, senderId, body) => {
    const newMsg = { id: 'cmsg-' + Date.now(), conversationId, senderId, body, sentAt: new Date().toISOString(), readAt: null }
    setMessages(prev => { const next = [newMsg, ...prev]; persist('im_messages', next); return next })
    setConversations(prev => {
      const next = prev.map(c => c.id === conversationId ? { ...c, lastMessage: body, lastMessageAt: new Date().toISOString() } : c)
      persist('im_conversations', next)
      return next
    })
    return newMsg
  }, [])

  const getConversationMessages = useCallback((conversationId) => {
    return messages.filter(m => m.conversationId === conversationId).sort((a, b) => a.sentAt?.localeCompare(b.sentAt))
  }, [messages])

  const getConversationsForUser = useCallback((userId) => {
    return conversations.filter(c => c.buyerId === userId || c.sellerId === userId)
  }, [conversations])

  // â”€â”€ Support Tickets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const createTicket = useCallback((ticket) => {
    const newTicket = { ...ticket, id: 'TKT-' + Date.now().toString().slice(-6), status: 'open', createdAt: new Date().toISOString(), responses: [] }
    setSupportTickets(prev => { const next = [newTicket, ...prev]; persist('im_support_tickets', next); return next })
    users.filter(u => u.role === 'admin').forEach(a => addNotification(a.id, 'ticket', `New support ticket ${newTicket.id}: ${ticket.subject}`, '/admin/support-tickets'))
    addActivityLog('Support ticket opened', ticket.userName || 'User', 'user', ticket.subject)
    return newTicket
  }, [addActivityLog, users, addNotification])

  const updateTicketStatus = useCallback((ticketId, status, adminNote = '') => {
    setSupportTickets(prev => {
      const next = prev.map(t => t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString(), adminNote } : t)
      persist('im_support_tickets', next)
      return next
    })
    const t = supportTickets.find(x => x.id === ticketId)
    if (t) addNotification(t.userId, 'ticket', `Your ticket ${ticketId} was marked "${status}"`, '/notifications')
    addActivityLog(`Ticket ${status}`, 'Admin', 'user', `TKT ${ticketId} marked ${status}`)
  }, [addActivityLog, supportTickets, addNotification])

  const addTicketResponse = useCallback((ticketId, authorId, authorName, message) => {
    setSupportTickets(prev => {
      const next = prev.map(t => t.id === ticketId ? { ...t, responses: [...(t.responses || []), { id: 'tr-' + Date.now(), authorId, authorName, message, sentAt: new Date().toISOString() }], updatedAt: new Date().toISOString() } : t)
      persist('im_support_tickets', next)
      return next
    })
    const t = supportTickets.find(x => x.id === ticketId)
    if (t) {
      if (authorId === t.userId) {
        users.filter(u => u.role === 'admin').forEach(a => addNotification(a.id, 'ticket', `${authorName} replied to ticket ${ticketId}`, '/admin/support-tickets'))
      } else {
        addNotification(t.userId, 'ticket', `Support replied to your ticket ${ticketId}`, '/notifications')
      }
    }
  }, [supportTickets, users, addNotification])

  const getTicketsByUser = useCallback((userId) => {
    return supportTickets.filter(t => t.userId === userId)
  }, [supportTickets])

  // â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addNotification = useCallback((userId, type, message, link = null) => {
    const notif = { id: 'n-' + Date.now(), userId, type, message, link, isRead: false, createdAt: new Date().toISOString() }
    setNotifications(prev => { const next = [notif, ...prev]; persist('im_notifications', next); return next })
    return notif
  }, [])

  const markNotificationRead = useCallback((notifId) => {
    setNotifications(prev => { const next = prev.map(n => n.id === notifId ? { ...n, isRead: true } : n); persist('im_notifications', next); return next })
  }, [])

  const markAllNotificationsRead = useCallback((userId) => {
    setNotifications(prev => { const next = prev.map(n => n.userId === userId ? { ...n, isRead: true } : n); persist('im_notifications', next); return next })
  }, [])

  const getNotificationsForUser = useCallback((userId) => {
    return notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [notifications])

  // â”€â”€ Blocklist â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [blocklist, setBlocklist] = useState(() => {
    const saved = localStorage.getItem('im_blocklist')
    return saved ? JSON.parse(saved) : []
  })

  const toggleBlockUser = useCallback((userId, blockedId) => {
    let nowBlocked = false
    setBlocklist(prev => {
      const exists = prev.some(b => b.userId === userId && b.blockedId === blockedId)
      nowBlocked = !exists
      const next = exists
        ? prev.filter(b => !(b.userId === userId && b.blockedId === blockedId))
        : [{ userId, blockedId, createdAt: new Date().toISOString() }, ...prev]
      persist('im_blocklist', next)
      return next
    })
    addActivityLog(nowBlocked ? 'User blocked' : 'User unblocked', 'User', 'user', `${userId} ${nowBlocked ? 'blocked' : 'unblocked'} ${blockedId}`)
    return nowBlocked
  }, [addActivityLog])

  const blockedIdsFor = useCallback((userId) => blocklist.filter(b => b.userId === userId).map(b => b.blockedId), [blocklist])
  const isBlockedBy = useCallback((ownerId, targetId) => blocklist.some(b => b.userId === ownerId && b.blockedId === targetId), [blocklist])

  // â”€â”€ Flash Sales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addFlashSale = useCallback((sale) => {
    const newSale = { ...sale, id: 'fs-' + Date.now(), createdAt: new Date().toISOString() }
    setFlashSales(prev => { const next = [newSale, ...prev]; persist('im_flash_sales', next); return next })
    addActivityLog('Flash sale created', 'Admin', 'product', `${sale.discountPercent}% off product ${sale.productId}`)
    return newSale
  }, [addActivityLog])

  const removeFlashSale = useCallback((saleId) => {
    setFlashSales(prev => { const next = prev.filter(s => s.id !== saleId); persist('im_flash_sales', next); return next })
  }, [])

  const getActiveFlashSales = useCallback(() => {
    const now = new Date().toISOString()
    return flashSales.filter(s => s.startsAt <= now && s.endsAt >= now)
  }, [flashSales])

  // â”€â”€ Wishlist â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addToWishlist = useCallback((userId, productId) => {
    const existing = wishlist.find(w => w.userId === userId && w.productId === productId)
    if (existing) return
    const item = { id: 'w-' + Date.now(), userId, productId, addedAt: new Date().toISOString() }
    setWishlist(prev => { const next = [item, ...prev]; persist('im_wishlist', next); return next })
  }, [wishlist])

  const removeFromWishlist = useCallback((userId, productId) => {
    setWishlist(prev => { const next = prev.filter(w => !(w.userId === userId && w.productId === productId)); persist('im_wishlist', next); return next })
  }, [])

  const getWishlistByUser = useCallback((userId) => {
    return wishlist.filter(w => w.userId === userId)
  }, [wishlist])

  const isInWishlist = useCallback((userId, productId) => {
    return wishlist.some(w => w.userId === userId && w.productId === productId)
  }, [wishlist])

  // â”€â”€ Consent Logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addConsentLog = useCallback((userId, action, purpose) => {
    const log = { id: 'cl-' + Date.now(), userId, action, purpose, consent: true, loggedAt: new Date().toISOString() }
    setConsentLogs(prev => { const next = [log, ...prev]; persist('im_consent_logs', next); return next })
  }, [])

  const getConsentLogsByUser = useCallback((userId) => {
    return consentLogs.filter(l => l.userId === userId)
  }, [consentLogs])

  // â”€â”€ Newsletter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const subscribeNewsletter = useCallback((email, userId = null) => {
    const existing = newsletter.find(n => n.email === email)
    if (existing) return existing
    const sub = { id: 'nl-' + Date.now(), email, userId, subscribedAt: new Date().toISOString(), active: true }
    setNewsletter(prev => { const next = [sub, ...prev]; persist('im_newsletter', next); return next })
    return sub
  }, [newsletter])

  const unsubscribeNewsletter = useCallback((email) => {
    setNewsletter(prev => { const next = prev.map(n => n.email === email ? { ...n, active: false, unsubscribedAt: new Date().toISOString() } : n); persist('im_newsletter', next); return next })
  }, [])

  // â”€â”€ Chat Sessions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const createChatSession = useCallback((userId = null, guestId = null) => {
    const session = { id: 'cs-' + Date.now(), userId, guestId, status: 'open', messages: [], escalatedTicketId: null, createdAt: new Date().toISOString() }
    setChatSessions(prev => { const next = [session, ...prev]; persist('im_chat_sessions', next); return next })
    return session
  }, [])

  const addChatMessage = useCallback((sessionId, role, body) => {
    setChatSessions(prev => {
      const next = prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, { id: 'cm-' + Date.now(), role, body, sentAt: new Date().toISOString() }] } : s)
      persist('im_chat_sessions', next)
      return next
    })
  }, [])

  const escalateChatToTicket = useCallback((sessionId, userId, subject) => {
    const session = chatSessions.find(s => s.id === sessionId)
    if (!session) return null
    const transcript = (session.messages || []).map(m => `[${m.role}] ${m.body}`).join('\n')
    const ticket = createTicket({ userId, userName: 'Chat User', subject, description: `Escalated from chat.\n\n${transcript}`, priority: 'normal' })
    setChatSessions(prev => {
      const next = prev.map(s => s.id === sessionId ? { ...s, status: 'escalated', escalatedTicketId: ticket.id } : s)
      persist('im_chat_sessions', next)
      return next
    })
    return ticket
  }, [chatSessions, createTicket])

  // â”€â”€ Payment Providers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const updatePaymentProvider = useCallback((providerId, updates) => {
    setPaymentProviders(prev => { const next = prev.map(p => p.id === providerId ? { ...p, ...updates } : p); persist('im_payment_providers', next); return next })
    addActivityLog('Payment provider updated', 'Admin', 'system', `Provider ${providerId} updated`)
  }, [addActivityLog])

  // â”€â”€ Theme Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const updateThemeSettings = useCallback((updates) => {
    setThemeSettings(prev => { const next = { ...prev, ...updates }; persist('im_theme_settings', next); return next })
    addActivityLog('Theme updated', 'Admin', 'system', 'Theme settings saved')
  }, [addActivityLog])

  const value = useMemo(() => ({
    products, orders, users, sellers, categories, reviews, activityLogs, payouts, transactions, messages, addresses, refunds,
    conversations, supportTickets, notifications, blocklist, flashSales, wishlist, consentLogs, newsletter, chatSessions, paymentProviders, themeSettings,
    addProduct, updateProduct, deleteProduct,
    addOrder, updateOrderStatus, bulkUpdateOrderStatus,
    updateUserStatus, updateUser,
    updateSellerStatus,
    addCategory, updateCategory, deleteCategory,
    addSeller, addReview, addPayout,
    addMessage, getMessagesByOrder, markMessagesRead,
    getProductReviews, getSellerProducts, getOrdersByBuyer, getOrdersBySeller,
    getTransactionStats, getSmartRecommendations, getLowStockProducts, getTrendingProducts, getNewArrivals, smartSearch, getSmartAlerts,
    getSellerMonthlySales, getSellerProductActivity, generateSellerReport,
    addActivityLog,
    addAddress, updateAddress, deleteAddress, setDefaultAddress, getAddressesByUser,
    requestRefund, updateRefundStatus, getRefundsByOrder,
    moderateReview,
    getOrCreateConversation, sendConversationMessage, getConversationMessages, getConversationsForUser,
    createTicket, updateTicketStatus, addTicketResponse, getTicketsByUser,
    addNotification, markNotificationRead, markAllNotificationsRead, getNotificationsForUser,
    blocklist, toggleBlockUser, blockedIdsFor, isBlockedBy,
    addFlashSale, removeFlashSale, getActiveFlashSales,
    addToWishlist, removeFromWishlist, getWishlistByUser, isInWishlist,
    addConsentLog, getConsentLogsByUser,
    subscribeNewsletter, unsubscribeNewsletter,
    createChatSession, addChatMessage, escalateChatToTicket,
    updatePaymentProvider, updateThemeSettings,
  }), [products, orders, users, sellers, categories, reviews, activityLogs, payouts, transactions, messages, addresses, refunds,
    conversations, supportTickets, notifications, blocklist, flashSales, wishlist, consentLogs, newsletter, chatSessions, paymentProviders, themeSettings,
    addProduct, updateProduct, deleteProduct,
    addOrder, updateOrderStatus, bulkUpdateOrderStatus,
    updateUserStatus, updateUser,
    updateSellerStatus,
    addCategory, updateCategory, deleteCategory,
    addSeller, addReview, addPayout,
    addMessage, getMessagesByOrder, markMessagesRead,
    getProductReviews, getSellerProducts, getOrdersByBuyer, getOrdersBySeller,
    getTransactionStats, getSmartRecommendations, getLowStockProducts, getTrendingProducts, getNewArrivals, smartSearch, getSmartAlerts,
    getSellerMonthlySales, getSellerProductActivity, generateSellerReport,
    addActivityLog,
    addAddress, updateAddress, deleteAddress, setDefaultAddress, getAddressesByUser,
    requestRefund, updateRefundStatus, getRefundsByOrder,
    moderateReview,
    getOrCreateConversation, sendConversationMessage, getConversationMessages, getConversationsForUser,
    createTicket, updateTicketStatus, addTicketResponse, getTicketsByUser,
    addNotification, markNotificationRead, markAllNotificationsRead, getNotificationsForUser,
    blocklist, toggleBlockUser, blockedIdsFor, isBlockedBy,
    addFlashSale, removeFlashSale, getActiveFlashSales,
    addToWishlist, removeFromWishlist, getWishlistByUser, isInWishlist,
    addConsentLog, getConsentLogsByUser,
    subscribeNewsletter, unsubscribeNewsletter,
    createChatSession, addChatMessage, escalateChatToTicket,
    updatePaymentProvider, updateThemeSettings])

  return (
    <DataStoreContext.Provider value={value}>
      {children}
    </DataStoreContext.Provider>
  )
}

export const useDataStore = () => useContext(DataStoreContext)
