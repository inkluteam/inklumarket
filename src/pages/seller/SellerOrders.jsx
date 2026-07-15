import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../context/ToastContext'
import { Search, Truck, CheckCircle, Clock } from 'lucide-react'

const statusColors = { pending: 'badge-yellow', processing: 'badge-blue', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' }

export default function SellerOrders() {
  const { user } = useAuth()
  const { getOrdersBySeller, updateOrderStatus } = useDataStore()
  const { formatMoney } = useSettings()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const sellerId = user?.sellerId
  const allOrders = getOrdersBySeller(sellerId)
  const filtered = allOrders.filter(o => {
    const matchSearch = !searchQuery || o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.buyer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus)
    toast.success(`Order ${orderId} marked as ${newStatus}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title mb-0">Order Management</h1>
        <span className="text-sm text-gray-500">{allOrders.length} order{allOrders.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="search" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-sm">{order.id}</td>
                  <td className="px-6 py-4 text-sm">{order.buyer}</td>
                  <td className="px-6 py-4 text-sm">
                    {order.items.map((item, i) => <p key={i} className="truncate max-w-[200px]">{item.name} × {item.qty}</p>)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">{formatMoney(order.total)}</td>
                  <td className="px-6 py-4 text-sm capitalize">{order.paymentMethod}</td>
                  <td className="px-6 py-4"><span className={`badge capitalize ${statusColors[order.status]}`}>{order.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {order.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'processing')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium" title="Mark as Processing">
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'shipped')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium" title="Mark as Shipped">
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'delivered')} className="p-1.5 text-green-600 hover:bg-green-50 rounded text-xs font-medium" title="Mark as Delivered">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-500">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
