import { useParams, Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { useDataStore } from '../../context/DataStore'
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react'

const statusColors = { pending: 'badge-yellow', processing: 'badge-blue', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' }
const statusSteps = ['pending', 'processing', 'shipped', 'delivered']
const paymentLabels = { cod: 'Cash on Delivery', gcash: 'GCash', bank: 'Bank Transfer' }

export default function OrderDetail() {
  const { id } = useParams()
  const { formatMoney } = useSettings()
  const { orders } = useDataStore()
  const order = orders.find(o => o.id === id)

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Link to="/buyer/orders" className="text-blue-600 hover:text-blue-700">Back to Orders</Link>
      </div>
    )
  }

  const currentStep = statusSteps.indexOf(order.status)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/buyer/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order {order.id}</h1>
          <p className="text-gray-600">Placed on {order.date}</p>
        </div>
        <span className={`badge text-sm ${statusColors[order.status]}`}>{order.status}</span>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="font-bold mb-4">Order Status</h2>
        <div className="flex items-center justify-between">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className={`flex flex-col items-center ${i <= currentStep ? 'text-blue-600' : 'text-gray-300'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                  {i === 0 && <Clock className="w-5 h-5" />}
                  {i === 1 && <Package className="w-5 h-5" />}
                  {i === 2 && <Truck className="w-5 h-5" />}
                  {i === 3 && <CheckCircle className="w-5 h-5" />}
                </div>
                <span className="text-xs font-semibold mt-1 capitalize">{step}</span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />}
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty} × {formatMoney(item.price)}</p>
                  </div>
                </div>
                <span className="font-semibold text-sm">{formatMoney(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-emerald-600">{formatMoney(order.total)}</span>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold mb-4">Shipping Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Recipient</span><span>{order.buyer}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Address</span><span>{order.shippingAddress || 'Not specified'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><span>{paymentLabels[order.paymentMethod] || order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-emerald-600 font-semibold">Free</span></div>
            {order.trackingNumber && (
              <div className="flex justify-between"><span className="text-gray-500">Tracking</span><span className="font-mono text-xs">{order.trackingNumber}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
