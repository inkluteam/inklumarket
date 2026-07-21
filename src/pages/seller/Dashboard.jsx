import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../context/ToastContext'
import { Package, DollarSign, ShoppingCart, TrendingUp, Plus, AlertTriangle, Download } from 'lucide-react'

function BarChart({ data, height = 200, color = '#2563eb', label = 'Value' }) {
  const maxVal = Math.max(...data.map(d => d.value), 1) * 1.1
  const barWidth = `${80 / data.length}%`

  return (
    <div>
      <div className="flex items-end justify-between" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center flex-1" style={{ gap: '4px' }}>
            <span className="text-xs font-medium text-gray-600">{d.value}</span>
            <div
              className="rounded-t-md transition-all duration-500 hover:opacity-80"
              style={{
                width: barWidth,
                height: `${Math.max((d.value / maxVal) * 100, 4)}%`,
                backgroundColor: d.color || color,
                maxWidth: '60px',
              }}
              title={`${d.label}: ${d.value} ${label}`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 border-t pt-2">
        {data.map((d, i) => (
          <span key={i} className="text-xs text-gray-500 flex-1 text-center">{d.label}</span>
        ))}
      </div>
    </div>
  )
}

export default function SellerDashboard() {
  const { user } = useAuth()
  const { getSellerProducts, getOrdersBySeller, getLowStockProducts, getSellerMonthlySales, getSellerProductActivity, generateSellerReport } = useDataStore()
  const { formatMoney } = useSettings()
  const toast = useToast()
  const sellerId = user?.sellerId
  const sellerProducts = getSellerProducts(sellerId)
  const sellerOrders = getOrdersBySeller(sellerId)
  const totalRevenue = sellerOrders.reduce((s, o) => s + o.total, 0)
  const lowStock = getLowStockProducts().filter(p => p.sellerId === sellerId)

  const monthlySales = useMemo(() => getSellerMonthlySales(sellerId), [getSellerMonthlySales, sellerId])
  const productActivity = useMemo(() => getSellerProductActivity(sellerId), [getSellerProductActivity, sellerId])

  const stats = [
    { label: 'Total Products', value: sellerProducts.length, icon: Package, color: 'bg-amber-500', change: `${sellerProducts.filter(p => p.status === 'approved').length} approved` },
    { label: 'Total Revenue', value: formatMoney(totalRevenue), icon: DollarSign, color: 'bg-green-500', change: `${sellerOrders.length} orders` },
    { label: 'Total Orders', value: sellerOrders.length, icon: ShoppingCart, color: 'bg-cyan-500', change: `${sellerOrders.filter(o => o.status === 'pending').length} pending` },
    { label: 'Avg. Rating', value: sellerProducts.length > 0 ? (sellerProducts.reduce((s, p) => s + p.rating, 0) / sellerProducts.length).toFixed(1) : '0.0', icon: TrendingUp, color: 'bg-amber-600', change: 'Based on reviews' },
  ]

  const handleDownloadReport = () => {
    const report = generateSellerReport(sellerId)
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${user?.name || 'seller'}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Sales report downloaded!')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title mb-1">Seller Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name || 'Seller'}!</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownloadReport} className="btn-outline flex items-center gap-2 text-sm !py-2 !px-4">
            <Download className="w-4 h-4" /> Download Report
          </button>
          <Link to="/seller/products" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> Manage Products
          </Link>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800">Low Stock Alert</p>
            <p className="text-sm text-yellow-700">{lowStock.length} product{lowStock.length !== 1 ? 's' : ''} running low on stock: {lowStock.map(p => p.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Monthly Sales Performance</h2>
          <BarChart data={monthlySales} height={200} color="#16A34A" label="revenue" />
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Product Listings Activity</h2>
          <BarChart data={productActivity} height={200} color="#D97706" label="products" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Recent Orders</h2>
            <Link to="/seller/seller-orders" className="text-amber-600 hover:text-amber-700 text-sm font-medium">View All</Link>
          </div>
          <div className="space-y-3">
            {sellerOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.buyer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatMoney(order.total)}</p>
                  <span className={`badge text-xs ${order.status === 'delivered' ? 'badge-green' : order.status === 'pending' ? 'badge-yellow' : 'badge-blue'}`}>{order.status}</span>
                </div>
              </div>
            ))}
            {sellerOrders.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">My Products</h2>
            <Link to="/seller/products" className="text-amber-600 hover:text-amber-700 text-sm font-medium">View All</Link>
          </div>
          <div className="space-y-3">
            {sellerProducts.slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{formatMoney(product.price)} · {product.stock} in stock</p>
                </div>
                <span className="text-sm text-gray-500">{product.reviews} reviews</span>
              </div>
            ))}
            {sellerProducts.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No products yet</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/seller/products" className="card p-4 text-center hover:scale-105 transition-transform">
          <Package className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <span className="text-sm font-semibold">Products</span>
        </Link>
        <Link to="/seller/seller-orders" className="card p-4 text-center hover:scale-105 transition-transform">
          <ShoppingCart className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <span className="text-sm font-semibold">Orders</span>
        </Link>
        <Link to="/seller/analytics" className="card p-4 text-center hover:scale-105 transition-transform">
          <TrendingUp className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
          <span className="text-sm font-semibold">Analytics</span>
        </Link>
        <Link to="/seller/payouts" className="card p-4 text-center hover:scale-105 transition-transform">
          <DollarSign className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <span className="text-sm font-semibold">Payouts</span>
        </Link>
      </div>
    </div>
  )
}
