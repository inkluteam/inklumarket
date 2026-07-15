import { ArrowUp, ArrowDown, DollarSign, Users, Package, ShoppingCart } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'

function LineChart({ data, width = 600, height = 240, color = '#059669', currencySymbol = '$' }) {
  const padding = { top: 20, right: 20, bottom: 40, left: 65 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const maxVal = Math.max(...data.map(d => d.value)) * 1.1

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - (d.value / maxVal) * chartH,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  const yTicks = 5
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((i / yTicks) * maxVal))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id={`adminGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTickValues.map((val, i) => {
        const y = padding.top + chartH - (val / maxVal) * chartH
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize="11">{currencySymbol}{(val / 1000).toFixed(1)}k</text>
          </g>
        )
      })}
      <path d={areaD} fill={`url(#adminGrad-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2.5" />
          <text x={p.x} y={padding.top + chartH + 20} textAnchor="middle" className="fill-gray-500" fontSize="12">{data[i].label}</text>
          <text x={p.x} y={p.y - 12} textAnchor="middle" className="fill-gray-700" fontSize="11" fontWeight="600">{currencySymbol}{(data[i].value / 1000).toFixed(1)}k</text>
        </g>
      ))}
    </svg>
  )
}

function DonutChart({ data, size = 210 }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let cumulative = 0
  const radius = size / 2 - 10
  const cx = size / 2, cy = size / 2

  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2
    cumulative += d.value
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2
    const largeArc = d.value / total > 0.5 ? 1 : 0
    const x1 = cx + radius * Math.cos(startAngle), y1 = cy + radius * Math.sin(startAngle)
    const x2 = cx + radius * Math.cos(endAngle), y2 = cy + radius * Math.sin(endAngle)
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`, pct: ((d.value / total) * 100).toFixed(0) }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={radius + 5} fill="white" />
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
        <circle cx={cx} cy={cy} r={radius * 0.55} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-gray-900" fontSize="16" fontWeight="700">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-gray-400" fontSize="10">products</text>
      </svg>
      <div className="space-y-2.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-sm truncate">{s.label}</span>
            <span className="text-xs text-gray-500 ml-auto">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HorizontalBar({ label, value, max, color, display }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium truncate mr-2">{label}</span>
        <span className="text-gray-600 flex-shrink-0">{display}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function AdminReports() {
  const { formatMoney, currencySymbol } = useSettings()
  const { orders, sellers, categories, products, transactions } = useDataStore()
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const totalFees = transactions.reduce((s, t) => s + t.platformFee, 0)
  const totalPayouts = transactions.reduce((s, t) => s + t.sellerPayout, 0)
  const approvedProducts = products.filter(p => p.status === 'approved').length
  const activeSellers = sellers.filter(s => s.status === 'active').length

  const revenueData = [
    { label: 'Aug', value: 4200 }, { label: 'Sep', value: 5100 }, { label: 'Oct', value: 4800 },
    { label: 'Nov', value: 6200 }, { label: 'Dec', value: 5800 }, { label: 'Jan', value: Math.round(totalRevenue * 3) },
  ]

  const ordersByStatus = [
    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#059669' },
    { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: '#2563eb' },
    { label: 'Processing', value: orders.filter(o => o.status === 'processing').length, color: '#f59e0b' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#ef4444' },
  ]

  const categoryData = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat.id)
    const catSales = catProducts.reduce((s, p) => s + p.reviews, 0)
    return { label: `${cat.icon} ${cat.name}`, value: catProducts.length, color: ['#2563eb', '#059669', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'][categories.indexOf(cat)], display: `${catProducts.length} products · ${catSales} reviews` }
  })
  const maxCat = Math.max(...categoryData.map(d => d.value))

  const topSellers = sellers.filter(s => s.status === 'active').sort((a, b) => b.totalSales - a.totalSales).slice(0, 6)
  const maxSales = Math.max(...topSellers.map(s => s.totalSales))

  const paymentMethods = [
    { label: 'GCash', value: orders.filter(o => o.paymentMethod === 'gcash').length, color: '#2563eb' },
    { label: 'Cash on Delivery', value: orders.filter(o => o.paymentMethod === 'cod').length, color: '#059669' },
    { label: 'Bank Transfer', value: orders.filter(o => o.paymentMethod === 'bank').length, color: '#f59e0b' },
  ]

  return (
    <div>
      <h1 className="page-title">Reports & Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Monthly Revenue', value: formatMoney(Math.round(totalRevenue * 3)), icon: DollarSign, change: '+22%', up: true, color: '#059669' },
          { label: 'Active Users', value: '156', icon: Users, change: '+15%', up: true, color: '#2563eb' },
          { label: 'Products Listed', value: approvedProducts.toString(), icon: Package, change: '+8%', up: true, color: '#f59e0b' },
          { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingCart, change: '+18%', up: true, color: '#8b5cf6' },
        ].map(m => (
          <div key={m.label} className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <m.icon className="w-5 h-5" style={{ color: m.color }} />
              <span className={`flex items-center gap-1 text-sm font-medium ${m.up ? 'text-green-600' : 'text-red-600'}`}>
                {m.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {m.change}
              </span>
            </div>
            <p className="text-2xl font-bold">{m.value}</p>
            <p className="text-sm text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Revenue Trend</h2>
            <span className="text-sm text-gray-500">Last 6 months</span>
          </div>
          <div className="h-64">
            <LineChart data={revenueData} color="#059669" currencySymbol={currencySymbol} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Order Status</h2>
          <DonutChart data={ordersByStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Top Sellers by Revenue</h2>
          <div className="space-y-4">
            {topSellers.map((s, i) => (
              <div key={s.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                    <span className="font-medium">{s.name}</span>
                  </span>
                  <span className="text-emerald-600 font-semibold">{formatMoney(s.totalSales)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${(s.totalSales / maxSales) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Category Performance</h2>
          <div className="space-y-4">
            {categoryData.map((d, i) => (
              <HorizontalBar key={i} {...d} max={maxCat} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Payment Methods</h2>
          <DonutChart
            data={paymentMethods}
            size={180}
          />
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Financial Summary</h2>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-800">{formatMoney(totalRevenue)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Platform Fees (5%)</p>
              <p className="text-2xl font-bold text-blue-800">{formatMoney(totalFees)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Seller Payouts</p>
              <p className="text-2xl font-bold text-purple-800">{formatMoney(totalPayouts)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg. Order Value</span>
              <span className="font-bold">{formatMoney(totalRevenue / orders.length)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Active Sellers</span>
              <span className="font-bold">{activeSellers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Products / Seller</span>
              <span className="font-bold">{(approvedProducts / activeSellers).toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-bold text-green-600">{((orders.filter(o => o.status === 'delivered').length / orders.length) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg. Rating</span>
              <span className="font-bold">4.7 ⭐</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
