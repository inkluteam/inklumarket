import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'
import { Package, Eye } from 'lucide-react'

const statusColors = { pending: 'badge-yellow', processing: 'badge-blue', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' }

export default function Orders() {
  const { user } = useAuth()
  const { getOrdersByBuyer } = useDataStore()
  const { formatMoney } = useSettings()
  const userOrders = user ? getOrdersByBuyer(user.id) : []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="page-title">My Orders</h1>

      {userOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <Link to="/catalog" className="btn-primary">Browse Catalog</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map(order => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{order.id}</h3>
                    <span className={`badge ${statusColors[order.status]}`}>{order.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Placed on {order.date}</p>
                  <div className="mt-2">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm text-gray-600">{item.name} × {item.qty}</p>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xl font-bold text-green-600">{formatMoney(order.total)}</span>
                  <Link to={`/buyer/order-detail/${order.id}`} className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-medium">
                    <Eye className="w-4 h-4" /> View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
