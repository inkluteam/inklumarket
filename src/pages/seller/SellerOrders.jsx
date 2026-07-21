import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../context/ToastContext'
import { Search, Truck, CheckCircle, Clock, ChevronDown, X } from 'lucide-react'

const statusColors = { pending: 'badge-yellow', processing: 'badge-blue', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' }

export default function SellerOrders() {
  const { user } = useAuth()
  const { getOrdersBySeller, updateOrderStatus, bulkUpdateOrderStatus } = useDataStore()
  const { formatMoney } = useSettings()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkStatus, setBulkStatus] = useState('')
  const [showBulkDropdown, setShowBulkDropdown] = useState(false)

  const sellerId = user?.sellerId
  const allOrders = getOrdersBySeller(sellerId)
  const filtered = allOrders.filter(o => {
    const matchSearch = !searchQuery || o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.buyer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const toggleSelect = (orderId) => {
    setSelectedIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map(o => o.id))
    }
  }

  const handleBulkUpdate = () => {
    if (!bulkStatus || selectedIds.length === 0) return
    bulkUpdateOrderStatus(selectedIds, bulkStatus)
    toast.success(`${selectedIds.length} order(s) marked as ${bulkStatus}`)
    setSelectedIds([])
    setBulkStatus('')
    setShowBulkDropdown(false)
  }

  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus)
    toast.success(`Order ${orderId} marked as ${newStatus}`)
  }

  const nextStatus = { pending: 'processing', processing: 'shipped', shipped: 'delivered' }

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

        {selectedIds.length > 0 && (
          <div className="px-4 py-3 bg-amber-50 border-b flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-amber-700">{selectedIds.length} selected</span>
            <button onClick={() => setSelectedIds([])} className="text-amber-500 hover:text-amber-700 text-sm flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
            <div className="relative ml-auto">
              <button
                onClick={() => setShowBulkDropdown(!showBulkDropdown)}
                className="btn-primary text-sm !py-2 !px-4 flex items-center gap-2"
              >
                Bulk Update Status <ChevronDown className="w-4 h-4" />
              </button>
              {showBulkDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 w-48">
                  {['processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => { setBulkStatus(status); setShowBulkDropdown(false) }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${bulkStatus === status ? 'bg-amber-50 text-amber-700 font-medium' : ''}`}
                    >
                      Mark as {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {bulkStatus && (
              <button onClick={handleBulkUpdate} className="btn-secondary text-sm !py-2 !px-4">
                Apply: Mark {selectedIds.length} as {bulkStatus}
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Your Payout</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(order => (
                <tr key={order.id} className={`hover:bg-gray-50 ${selectedIds.includes(order.id) ? 'bg-amber-50' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">{order.id}</td>
                  <td className="px-6 py-4 text-sm">{order.buyer}</td>
                  <td className="px-6 py-4 text-sm">
                    {order.items.map((item, i) => <p key={i} className="truncate max-w-[200px]">{item.name} × {item.qty}</p>)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">{formatMoney(order.total)}</td>
                  <td className="px-6 py-4 font-semibold text-amber-600 text-sm">{formatMoney(order.total * 0.95)}</td>
                  <td className="px-6 py-4 text-sm capitalize">{order.paymentMethod}</td>
                  <td className="px-6 py-4"><span className={`badge capitalize ${statusColors[order.status]}`}>{order.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {nextStatus[order.status] && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, nextStatus[order.status])}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded text-xs font-medium"
                          title={`Mark as ${nextStatus[order.status]}`}
                        >
                          {order.status === 'pending' && <Clock className="w-4 h-4" />}
                          {order.status === 'processing' && <Truck className="w-4 h-4" />}
                          {order.status === 'shipped' && <CheckCircle className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="10" className="px-6 py-12 text-center text-gray-500">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
