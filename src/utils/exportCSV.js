export function exportCSV(headers, rows, filename) {
  const escape = (val) => {
    const str = String(val ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportOrdersCSV(orders, formatMoney, filename = 'orders.csv') {
  const headers = ['Order ID', 'Customer', 'Items', 'Total', 'Payment Method', 'Status', 'Date', 'Shipping Address']
  const rows = orders.map(o => [
    o.id,
    o.buyer,
    o.items.map(i => `${i.name} x${i.qty}`).join('; '),
    formatMoney(o.total),
    o.paymentMethod,
    o.status,
    o.date,
    o.shippingAddress || ''
  ])
  exportCSV(headers, rows, filename)
}

export function exportTransactionsCSV(transactions, formatMoney, filename = 'transactions.csv') {
  const headers = ['Transaction ID', 'Order ID', 'Seller', 'Sale Amount', 'Platform Fee', 'Seller Payout', 'Date']
  const rows = transactions.map(t => [
    t.id,
    t.orderId,
    t.sellerName,
    formatMoney(t.saleAmount),
    formatMoney(t.platformFee),
    formatMoney(t.sellerPayout),
    t.date
  ])
  exportCSV(headers, rows, filename)
}

export function exportProductsCSV(products, formatMoney, filename = 'products.csv') {
  const headers = ['Product ID', 'Name', 'Seller', 'Category', 'Price', 'Stock', 'Status', 'Rating', 'Reviews']
  const rows = products.map(p => [
    p.id,
    p.name,
    p.sellerName,
    p.category,
    formatMoney(p.price),
    p.stock,
    p.status,
    p.rating,
    p.reviews
  ])
  exportCSV(headers, rows, filename)
}

export function exportSellersCSV(sellers, formatMoney, filename = 'sellers.csv') {
  const headers = ['Seller ID', 'Name', 'Email', 'Phone', 'Status', 'Products', 'Total Sales', 'Rating']
  const rows = sellers.map(s => [
    s.id,
    s.name,
    s.email,
    s.phone,
    s.status,
    s.productCount,
    formatMoney(s.totalSales),
    s.rating
  ])
  exportCSV(headers, rows, filename)
}
