import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Send, AlertTriangle, MessageSquare } from 'lucide-react'

const statusColors = { pending: 'badge-yellow', processing: 'badge-blue', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' }
const statusSteps = ['pending', 'processing', 'shipped', 'delivered']
const statusTimestamps = {
  pending: 'Order placed and awaiting confirmation',
  processing: 'Seller is preparing your order',
  shipped: 'Package is on its way',
  delivered: 'Package has been delivered',
}
const paymentLabels = { cod: 'Cash on Delivery', gcash: 'GCash', bank: 'Bank Transfer' }

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { formatMoney } = useSettings()
  const { orders, products, addMessage, getMessagesByOrder, markMessagesRead } = useDataStore()
  const toast = useToast()
  const order = orders.find(o => o.id === id)
  const messagesEndRef = useRef(null)
  const [newMessage, setNewMessage] = useState('')
  const [isDispute, setIsDispute] = useState(false)

  const orderMessages = order ? getMessagesByOrder(order.id) : []

  useEffect(() => {
    if (order && user) {
      markMessagesRead(order.id, user.id)
    }
  }, [order, user, markMessagesRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [orderMessages.length])

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Link to="/buyer/orders" className="text-blue-600 hover:text-blue-700">Back to Orders</Link>
      </div>
    )
  }

  const currentStep = statusSteps.indexOf(order.status)
  const orderProduct = order.items[0]
  const product = products.find(p => p.id === orderProduct?.productId)
  const sellerId = product?.sellerId

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    addMessage({
      orderId: order.id,
      senderId: user.id,
      senderName: user.name || 'Buyer',
      senderRole: 'buyer',
      receiverId: sellerId,
      text: newMessage.trim(),
      isDispute,
    })
    setNewMessage('')
    setIsDispute(false)
    toast.success(isDispute ? 'Dispute submitted' : 'Message sent to seller')
  }

  const formatTimestamp = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

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

      {/* Enhanced Order Status Tracker */}
      <div className="card p-6 mb-8">
        <h2 className="font-bold mb-4">Order Status Tracker</h2>
        <div className="flex items-center justify-between mb-6">
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
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-semibold text-sm capitalize">{order.status}</span>
          </div>
          <p className="text-sm text-gray-600">{statusTimestamps[order.status]}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

      {/* Messaging / Dispute Section */}
      <div className="card">
        <div className="p-4 border-b flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold">Order Messages</h2>
          {orderMessages.filter(m => m.isDispute).length > 0 && (
            <span className="badge badge-red flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Dispute Open
            </span>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-4 space-y-3">
          {orderMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No messages yet. Start a conversation with the seller.</p>
            </div>
          ) : (
            orderMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg p-3 ${msg.senderId === user.id ? 'bg-blue-600 text-white' : 'bg-gray-100'} ${msg.isDispute ? 'ring-2 ring-red-400' : ''}`}>
                  {msg.isDispute && (
                    <div className="flex items-center gap-1 text-xs font-semibold mb-1 opacity-90">
                      <AlertTriangle className="w-3 h-3" /> Dispute
                    </div>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.senderName} · {formatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setIsDispute(false)}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${!isDispute ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <MessageSquare className="w-3 h-3 inline mr-1" /> Message
            </button>
            <button
              onClick={() => setIsDispute(true)}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${isDispute ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <AlertTriangle className="w-3 h-3 inline mr-1" /> Dispute
            </button>
          </div>
          {isDispute && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-700">
              You are filing a dispute. Describe the issue with your order and the seller will be notified.
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isDispute ? 'Describe the issue...' : 'Type a message...'}
              className="input-field flex-1"
            />
            <button onClick={handleSendMessage} className="btn-primary !px-4 flex items-center gap-2">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
