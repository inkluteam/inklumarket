import { TrendingUp, DollarSign, ShoppingCart, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'
import { useState, useMemo } from 'react'

function LineChart({ data, width = 600, height = 250, color = '#2563eb', currencySymbol = '$' }) {
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const maxVal = Math.max(...data.map(d => d.value), 1) * 1.1
  const points = data.map((d, i) => ({ x: padding.left + (i / (data.length - 1)) * chartW, y: padding.top + chartH - (d.value / maxVal) * chartH }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
  const yTicks = 5
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((i / yTicks) * maxVal))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs><linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs>
      {yTickValues.map((val, i) => { const y = padding.top + chartH - (val / maxVal) * chartH; return (<g key={i}><line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#e5e7eb" strokeWidth="1" /><text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize="11">{currencySymbol}{val.toFixed(0)}</text></g>) })}
      <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (<g key={i}><circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2.5" /><text x={p.x} y={padding.top + chartH + 20} textAnchor="middle" className="fill-gray-500" fontSize="12">{data[i].label}</text></g>))}
    </svg>
  )
}

function DonutChart({ data, size = 220, currencySymbol = '$' }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let cumulative = 0
  const radius = size / 2 - 10; const cx = size / 2; const cy = size / 2
  const slices = data.map((d) => { const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2; cumulative += d.value; const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2; const largeArc = d.value / total > 0.5 ? 1 : 0; const x1 = cx + radius * Math.cos(startAngle); const y1 = cy + radius * Math.sin(startAngle); const x2 = cx + radius * Math.cos(endAngle); const y2 = cy + radius * Math.sin(endAngle); return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`, pct: ((d.value / total) * 100).toFixed(0) } })
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={cx} cy={cy} r={radius + 5} fill="white" />{slices.map((s, i) => <path key={i} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity" />)}<circle cx={cx} cy={cy} r={radius * 0.55} fill="white" /><text x={cx} y={cy + 4} textAnchor="middle" className="fill-gray-900" fontSize="14" fontWeight="700">{currencySymbol}{total.toFixed(0)}</text></svg>
      <div className="space-y-3">{slices.map((s, i) => <div key={i} className="flex items-center gap-3"><span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{s.label}</p><p className="text-xs text-gray-500">{s.pct}%</p></div></div>)}</div>
    </div>
  )
}

function HorizontalBarChart({ data, maxValue }) {
  return (<div className="space-y-4">{data.map((d, i) => (<div key={i}><div className="flex justify-between text-sm mb-1"><span className="font-medium truncate mr-2">{d.label}</span><span className="text-gray-600 flex-shrink-0">{d.display || d.value}</span></div><div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className="h-3 rounded-full transition-all duration-700" style={{ width: `${Math.max((d.value / maxValue) * 100, 2)}%`, backgroundColor: d.color || '#2563eb' }} /></div></div>))}</div>)
}

export default function SellerAnalytics() {
  const { user } = useAuth()
  const { getSellerProducts, getOrdersBySeller, reviews } = useDataStore()
  const { currencySymbol, formatMoney } = useSettings()
  const [timeRange, setTimeRange] = useState('6m')
  const sellerId = user?.sellerId
  const sellerProducts = getSellerProducts(sellerId)
  const sellerOrders = getOrdersBySeller(sellerId)
  const totalRevenue = sellerOrders.reduce((s, o) => s + o.total, 0)
  const sellerReviews = reviews.filter(r => sellerProducts.some(p => p.id === r.productId))

  const avgRating = sellerProducts.length > 0 ? (sellerProducts.reduce((s, p) => s + p.rating, 0) / sellerProducts.length).toFixed(1) : '0.0'

  const revenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const total = totalRevenue || 2450
    return months.map((m, i) => ({ label: m, value: Math.round(total * (0.1 + i * 0.15) + Math.random() * 200) }))
  }, [totalRevenue])

  const categoryPerformance = useMemo(() => {
    const cats = {}
    sellerProducts.forEach(p => { cats[p.category] = (cats[p.category] || 0) + p.price * p.reviews })
    const colors = ['#2563eb', '#059669', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444']
    return Object.entries(cats).map(([cat, val], i) => ({ label: cat, value: Math.round(val), color: colors[i % colors.length], display: formatMoney(val) }))
  }, [sellerProducts, formatMoney])

  const maxCategory = Math.max(...categoryPerformance.map(d => d.value), 1)
  const maxProduct = Math.max(...sellerProducts.map(p => p.reviews), 1)

  const productPerformance = sellerProducts.map(p => ({ label: p.name, value: p.reviews, color: '#2563eb', display: `${p.reviews} reviews · ${formatMoney(p.price)}` })).sort((a, b) => b.value - a.value)

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]
    sellerReviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++ })
    const total = sellerReviews.length || 1
    return [5, 4, 3, 2, 1].map(stars => ({ stars, count: dist[stars - 1], pct: Math.round((dist[stars - 1] / total) * 100) }))
  }, [sellerReviews])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title mb-0">Analytics</h1>
        <div className="flex gap-2">
          {['7d', '30d', '6m', '1y'].map(range => (
            <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors cursor-pointer ${timeRange === range ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '6m' ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: formatMoney(totalRevenue), icon: DollarSign, change: `${sellerOrders.length} orders`, up: true },
          { label: 'Total Orders', value: sellerOrders.length, icon: ShoppingCart, change: `${sellerOrders.filter(o => o.status === 'pending').length} pending`, up: true },
          { label: 'Avg. Rating', value: avgRating, icon: Star, change: `${sellerReviews.length} reviews`, up: true },
          { label: 'Products', value: sellerProducts.length, icon: TrendingUp, change: `${sellerProducts.filter(p => p.stock <= 10).length} low stock`, up: true },
        ].map(m => (
          <div key={m.label} className="card p-6">
            <div className="flex items-center justify-between mb-2"><m.icon className="w-5 h-5 text-gray-400" /><span className="text-sm font-medium text-gray-500">{m.change}</span></div>
            <p className="text-2xl font-bold">{m.value}</p>
            <p className="text-sm text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-lg">Revenue Trend</h2><span className="text-sm text-gray-500">Last 6 months</span></div>
          <div className="h-72"><LineChart data={revenueData} color="#2563eb" currencySymbol={currencySymbol} /></div>
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Revenue by Category</h2>
          {categoryPerformance.length > 0 ? <DonutChart data={categoryPerformance} currencySymbol={currencySymbol} /> : <p className="text-gray-500 text-sm">No category data yet</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Top Products by Reviews</h2>
          {productPerformance.length > 0 ? <HorizontalBarChart data={productPerformance} maxValue={maxProduct} /> : <p className="text-gray-500 text-sm">No product data yet</p>}
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Category Performance</h2>
          {categoryPerformance.length > 0 ? <HorizontalBarChart data={categoryPerformance} maxValue={maxCategory} /> : <p className="text-gray-500 text-sm">No category data yet</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Rating Distribution</h2>
          <div className="space-y-3">
            {ratingDistribution.map(r => (
              <div key={r.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 flex-shrink-0"><span className="text-sm font-medium">{r.stars}</span><Star className="w-3 h-3 fill-amber-400 text-amber-400" /></div>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-amber-400 h-2.5 rounded-full transition-all" style={{ width: `${r.pct}%` }} /></div>
                <span className="text-sm text-gray-500 w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex items-center gap-3">
            <span className="text-3xl font-bold">{avgRating}</span>
            <div><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div><p className="text-xs text-gray-500">Based on {sellerReviews.length} reviews</p></div>
          </div>
        </div>
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-lg mb-4">Recent Reviews</h2>
          <div className="space-y-3">
            {sellerReviews.slice(0, 5).map(review => (
              <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div>
                  <span className="text-xs text-gray-500">{review.userName}</span>
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
            {sellerReviews.length === 0 && <p className="text-gray-500 text-sm">No reviews yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
