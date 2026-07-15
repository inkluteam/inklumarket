import { Link } from 'react-router-dom'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'

export default function AdminDashboard() {
  const { users, orders, sellers, activityLogs, getTransactionStats, getLowStockProducts } = useDataStore()
  const { formatMoney } = useSettings()
  const stats = getTransactionStats()
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const pendingSellers = sellers.filter(s => s.status === 'pending').length
  const suspendedUsers = users.filter(u => u.status === 'suspended').length
  const lowStock = getLowStockProducts()

  const statCards = [
    { label: 'Total Users', value: stats.userCount, icon: Users, color: 'bg-blue-500', change: `${users.filter(u => u.role === 'buyer').length} buyers, ${users.filter(u => u.role === 'seller').length} sellers` },
    { label: 'Total Products', value: stats.productCount, icon: Package, color: 'bg-emerald-500', change: `${pendingSellers} pending approval` },
    { label: 'Total Orders', value: stats.orderCount, icon: ShoppingCart, color: 'bg-amber-500', change: `${pendingOrders} pending` },
    { label: 'Revenue', value: formatMoney(stats.totalRevenue), icon: DollarSign, color: 'bg-purple-500', change: `Fees: ${formatMoney(stats.totalFees)}` },
  ]

  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(stat => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} p-3 rounded-lg`}><stat.icon className="w-6 h-6 text-white" /></div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Recent Orders</h2>
            <Link to="/admin/admin-orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="table-header"><th className="px-4 py-2 text-left">Order</th><th className="px-4 py-2 text-left">Customer</th><th className="px-4 py-2 text-left">Total</th><th className="px-4 py-2 text-left">Status</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 6).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-sm">{order.id}</td>
                    <td className="px-4 py-3 text-sm">{order.buyer}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600">{formatMoney(order.total)}</td>
                    <td className="px-4 py-3"><span className={`badge ${order.status === 'delivered' ? 'badge-green' : order.status === 'pending' ? 'badge-yellow' : 'badge-blue'}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Smart Alerts</h2>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-3">
            {pendingSellers > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-amber-800">{pendingSellers} seller application{pendingSellers > 1 ? 's' : ''} pending</p>
                <Link to="/admin/product-approvals" className="text-xs text-amber-600 hover:underline">Review now</Link>
              </div>
            )}
            {pendingOrders > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">{pendingOrders} order{pendingOrders > 1 ? 's' : ''} awaiting processing</p>
                <Link to="/admin/admin-orders" className="text-xs text-blue-600 hover:underline">View orders</Link>
              </div>
            )}
            {suspendedUsers > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">{suspendedUsers} user{suspendedUsers > 1 ? 's' : ''} suspended</p>
                <Link to="/admin/users" className="text-xs text-red-600 hover:underline">Review</Link>
              </div>
            )}
            {lowStock.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">{lowStock.length} product{lowStock.length !== 1 ? 's' : ''} low on stock</p>
              </div>
            )}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800">All systems operational</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Top Sellers</h2>
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
          </div>
          <div className="space-y-3">
            {sellers.filter(s => s.status === 'active').sort((a, b) => b.totalSales - a.totalSales).slice(0, 5).map(seller => (
              <div key={seller.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"><span className="text-emerald-600 font-bold text-sm">{seller.name[0]}</span></div>
                <div className="flex-1"><p className="font-medium text-sm">{seller.name}</p><p className="text-xs text-gray-500">{seller.location}</p></div>
                <span className="text-sm font-semibold text-emerald-600">{formatMoney(seller.totalSales)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Recent Activity</h2>
            <Link to="/admin/activity-logs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
          </div>
          <div className="space-y-3">
            {activityLogs.slice(0, 6).map(log => (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${log.type === 'user' ? 'bg-blue-500' : log.type === 'product' ? 'bg-emerald-500' : log.type === 'order' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{log.action}</p><p className="text-xs text-gray-500">by {log.user}</p></div>
                <span className="text-xs text-gray-400 shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin/users" className="card p-4 text-center hover:scale-105 transition-transform">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" /><span className="text-sm font-semibold">Users</span><span className="block text-xs text-gray-500">{stats.userCount} total</span>
        </Link>
        <Link to="/admin/product-approvals" className="card p-4 text-center hover:scale-105 transition-transform">
          <Package className="w-8 h-8 text-emerald-600 mx-auto mb-2" /><span className="text-sm font-semibold">Approvals</span><span className="block text-xs text-gray-500">{pendingSellers} pending</span>
        </Link>
        <Link to="/admin/admin-orders" className="card p-4 text-center hover:scale-105 transition-transform">
          <ShoppingCart className="w-8 h-8 text-amber-600 mx-auto mb-2" /><span className="text-sm font-semibold">Orders</span><span className="block text-xs text-gray-500">{pendingOrders} pending</span>
        </Link>
        <Link to="/admin/reports" className="card p-4 text-center hover:scale-105 transition-transform">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" /><span className="text-sm font-semibold">Reports</span><span className="block text-xs text-gray-500">Analytics</span>
        </Link>
      </div>
    </div>
  )
}
