import { useState, useEffect } from 'react'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'
import { Search, Eye, CheckCircle, Download, RotateCcw } from 'lucide-react'
import { exportOrdersCSV } from '../../utils/exportCSV'

const statusColors = { pending: 'badge-yellow', processing: 'badge-blue', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red', refunded: 'badge-purple' }
const paymentLabels = { cod: 'Cash on Delivery', gcash: 'GCash', bank: 'Bank Transfer' }

export default function AdminOrders() {
  const { orders, updateOrderStatus, refunds, updateRefundStatus } = useDataStore()
  const { formatMoney } = useSettings()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewOrder, setViewOrder] = useState(null)
  const [refundNote, setRefundNote] = useState('')

  useEffect(() => {
    if (!viewOrder) return
    const onKey = (e) => { if (e.key === 'Escape') setViewOrder(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [viewOrder])

  const filtered = orders.filter(o => {
    const matchSearch = !searchQuery || o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.buyer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title mb-0">Order Management</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
          <button onClick={() => exportOrdersCSV(filtered, formatMoney, 'inclusive-market-filtered-orders.csv')} className="btn-secondary text-sm flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="search" placeholder="Search orders by ID or customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
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
                  <td className="px-6 py-4 text-sm capitalize">{paymentLabels[order.paymentMethod] || order.paymentMethod}</td>
                  <td className="px-6 py-4"><span className={`badge capitalize ${statusColors[order.status]}`}>{order.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewOrder(order)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" aria-label="View order"><Eye className="w-4 h-4" /></button>
                      {order.status === 'pending' && (
                        <button onClick={() => { updateOrderStatus(order.id, 'processing') }} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><CheckCircle className="w-4 h-4" /></button>
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

      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewOrder(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order {viewOrder.id}</h2>
              <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Customer</span><p className="font-medium">{viewOrder.buyer}</p></div>
                <div><span className="text-gray-500">Date</span><p>{viewOrder.date}</p></div>
                <div><span className="text-gray-500">Payment</span><p className="capitalize">{paymentLabels[viewOrder.paymentMethod] || viewOrder.paymentMethod}</p></div>
                <div><span className="text-gray-500">Status</span><p><span className={`badge capitalize ${statusColors[viewOrder.status]}`}>{viewOrder.status}</span></p></div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                {viewOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b text-sm">
                    <span>{item.name} × {item.qty}</span>
                    <span className="font-medium">{formatMoney(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-2"><span>Total</span><span className="text-emerald-600">{formatMoney(viewOrder.total)}</span></div>
              </div>
              {viewOrder.shippingAddress && (
                <div><span className="text-gray-500 text-sm">Shipping Address</span><p className="text-sm">{viewOrder.shippingAddress}</p></div>
              )}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Refund Management</h3>
                {refunds.filter(r => r.orderId === viewOrder.id).length > 0 ? (
                  <div className="space-y-2">
                    {refunds.filter(r => r.orderId === viewOrder.id).map(ref => (
                      <div key={ref.id} className={`p-3 rounded-lg text-sm ${ref.status === 'approved' ? 'bg-green-50' : ref.status === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{ref.id} — {formatMoney(ref.amount)}</p>
                            <p className="text-gray-600 text-xs">{ref.reason}</p>
                            {ref.adminNote && <p className="text-xs mt-1 text-gray-500">Admin: {ref.adminNote}</p>}
                          </div>
                          <span className={`badge capitalize ${ref.status === 'approved' ? 'badge-green' : ref.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>{ref.status}</span>
                        </div>
                        {ref.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Admin note (optional)"
                              value={refundNote}
                              onChange={(e) => setRefundNote(e.target.value)}
                              className="input-field text-xs flex-1"
                            />
                            <button onClick={() => { updateRefundStatus(ref.id, 'approved', refundNote); setRefundNote('') }} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">Approve</button>
                            <button onClick={() => { updateRefundStatus(ref.id, 'rejected', refundNote); setRefundNote('') }} className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No refund requests for this order.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
