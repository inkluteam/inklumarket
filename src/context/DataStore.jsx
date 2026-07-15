import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { categories as initCategories, sellers as initSellers, products as initProducts, users as initUsers, orders as initOrders, reviews as initReviews, activityLogs as initLogs, payouts as initPayouts, transactions as initTransactions } from '../data/mockData'

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

  const persist = (key, data) => localStorage.setItem(key, JSON.stringify(data))

  const addActivityLog = useCallback((action, user, type, details) => {
    const newLog = { id: 'a' + Date.now(), action, user, type, time: 'Just now', icon: type === 'user' ? 'User' : type === 'product' ? 'Package' : type === 'order' ? 'ShoppingCart' : 'Settings', details }
    setActivityLogs(prev => {
      const next = [newLog, ...prev]
      persist('im_activity_logs', next)
      return next
    })
  }, [])

  const addProduct = useCallback((product) => {
    const newProduct = { ...product, id: String(Date.now()), rating: 0, reviews: 0, status: 'approved', dateAdded: new Date().toISOString().split('T')[0] }
    setProducts(prev => {
      const next = [...prev, newProduct]
      persist('im_products', next)
      return next
    })
    addActivityLog('Product listed', product.seller || 'Seller', 'product', `${product.name} added for review`)
    return newProduct
  }, [addActivityLog])

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p)
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
    addActivityLog('Order placed', order.buyer || 'Buyer', 'order', `${newOrder.id} for ₱${order.total.toFixed(2)}`)
    return newOrder
  }, [addActivityLog])

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev => {
      const next = prev.map(o => o.id === orderId ? { ...o, status } : o)
      persist('im_orders', next)
      return next
    })
    addActivityLog('Order updated', 'System', 'order', `${orderId} marked as ${status}`)
  }, [addActivityLog])

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

  const updateUserStatus = useCallback((userId, status) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, status } : u)
      persist('im_users', next)
      return next
    })
    addActivityLog(status === 'active' ? 'User activated' : 'User suspended', 'Admin', 'user', `Account ${status}`)
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
    lines.push('═══════════════════════════════════════════════')
    lines.push('         INCLUSIVE MARKET — SALES REPORT')
    lines.push('═══════════════════════════════════════════════')
    lines.push(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
    lines.push('')
    lines.push('── SUMMARY ──────────────────────────────────')
    lines.push(`Total Products:    ${sellerProducts.length}`)
    lines.push(`Total Orders:      ${sellerOrders.length}`)
    lines.push(`Total Revenue:     ₱${totalRevenue.toFixed(2)}`)
    lines.push(`Avg Order Value:   ₱${sellerOrders.length > 0 ? (totalRevenue / sellerOrders.length).toFixed(2) : '0.00'}`)
    lines.push('')
    lines.push('── ORDER STATUS BREAKDOWN ───────────────────')
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      lines.push(`  ${status.charAt(0).toUpperCase() + status.slice(1).padEnd(12)} ${count}`)
    })
    lines.push('')
    lines.push('── PRODUCT LISTINGS ─────────────────────────')
    sellerProducts.forEach((p, i) => {
      lines.push(`  ${i + 1}. ${p.name}`)
      lines.push(`     Price: ₱${p.price.toFixed(2)}  |  Stock: ${p.stock}  |  Rating: ${p.rating}★  |  Reviews: ${p.reviews}`)
    })
    lines.push('')
    lines.push('── ORDER HISTORY ────────────────────────────')
    sellerOrders.forEach((o, i) => {
      lines.push(`  ${i + 1}. ${o.id} — ${o.buyer}`)
      lines.push(`     Date: ${o.date}  |  Total: ₱${o.total.toFixed(2)}  |  Status: ${o.status}`)
      o.items.forEach(item => {
        lines.push(`     └ ${item.name} x${item.qty} @ ₱${item.price.toFixed(2)}`)
      })
    })
    lines.push('')
    lines.push('═══════════════════════════════════════════════')
    lines.push('        End of Report — Inclusive Market')
    lines.push('═══════════════════════════════════════════════')

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
    if (totalRevenue > 10000) alerts.push({ type: 'success', title: 'Revenue Milestone', message: `Platform revenue has exceeded ₱10,000`, icon: 'TrendingUp' })
    if (avgRating >= 4.5) alerts.push({ type: 'success', title: 'High Satisfaction', message: `Average product rating is ${avgRating.toFixed(1)}/5 stars`, icon: 'Star' })
    if (alerts.length === 0) alerts.push({ type: 'success', title: 'All Systems Operational', message: 'No issues detected', icon: 'CheckCircle' })
    return alerts
  }, [products, orders, sellers, users])

  const value = useMemo(() => ({
    products, orders, users, sellers, categories, reviews, activityLogs, payouts, transactions, messages,
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
  }), [products, orders, users, sellers, categories, reviews, activityLogs, payouts, transactions, messages,
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
    addActivityLog])

  return (
    <DataStoreContext.Provider value={value}>
      {children}
    </DataStoreContext.Provider>
  )
}

export const useDataStore = () => useContext(DataStoreContext)
