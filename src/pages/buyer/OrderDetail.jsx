import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Send, AlertTriangle, MessageSquare, RotateCcw, Bot } from 'lucide-react'

const statusColors = { pending: 'badge-yellow', processing: 'badge-blue', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' }
const statusSteps = ['pending', 'processing', 'shipped', 'delivered']
const statusTimestamps = {
  pending: 'Order placed and awaiting confirmation',
  processing: 'Seller is preparing your order',
  shipped: 'Package is on its way',
  delivered: 'Package has been delivered',
}
const paymentLabels = { cod: 'Cash on Delivery', gcash: 'GCash', bank: 'Bank Transfer' }

const AUTO_MESSAGES = {
  message: [
    "Thank you for your message! The seller has been notified and will respond shortly.",
    "Your message has been sent successfully. The seller typically responds within 24 hours.",
    "Message received! You will be notified when the seller replies.",
  ],
  dispute: [
    "Your dispute has been filed and escalated. Our support team will review this within 12 hours and contact both parties.",
    "Dispute submitted successfully. An Inclusive Market mediator will review your case and respond within 12-24 hours.",
    "Your dispute has been recorded. Our team prioritizes dispute resolution and will reach out to you shortly.",
  ],
}

function getAutoMessage(isDispute) {
  const msgs = isDispute ? AUTO_MESSAGES.dispute : AUTO_MESSAGES.message
  return msgs[Math.floor(Math.random() * msgs.length)]
}

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { formatMoney } = useSettings()
  const { orders, products, addMessage, getMessagesByOrder, markMessagesRead, refunds, requestRefund } = useDataStore()
  const toast = useToast()
  const order = orders.find(o => o.id === id)
  const messagesEndRef = useRef(null)
  const [newMessage, setNewMessage] = useState('')
  const [isDispute, setIsDispute] = useState(false)
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')

  const orderRefunds = order ? refunds.filter(r => r.orderId === order.id) : []
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
        <Link to="/buyer/orders" className="text-amber-600 hover:text-amber-700">Back to Orders</Link>
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

    setTimeout(() => {
      addMessage({
        orderId: order.id,
        senderId: 'system-auto',
        senderName: 'Inclusive Market Support',
        senderRole: 'system',
        receiverId: user.id,
        text: getAutoMessage(isDispute),
        isDispute: false,
      })
    }, 1500)
  }

  const formatTimestamp = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/buyer/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-6">
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
              <div className={`flex flex-col items-center ${i <= currentStep ? 'text-amber-600' : 'text-gray-300'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-amber-600 text-white' : 'bg-gray-100'}`}>
                  {i === 0 && <Clock className="w-5 h-5" />}
                  {i === 1 && <Package className="w-5 h-5" />}
                  {i === 2 && <Truck className="w-5 h-5" />}
                  {i === 3 && <CheckCircle className="w-5 h-5" />}
                </div>
                <span className="text-xs font-semibold mt-1 capitalize">{step}</span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 ${i < currentStep ? 'bg-amber-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
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
            <span className="text-green-600">{formatMoney(order.total)}</span>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold mb-4">Shipping Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Recipient</span><span>{order.buyer}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Address</span><span>{order.shippingAddress || 'Not specified'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><span>{paymentLabels[order.paymentMethod] || order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-green-600 font-semibold">Free</span></div>
            {order.trackingNumber && (
              <div className="flex justify-between"><span className="text-gray-500">Tracking</span><span className="font-mono text-xs">{order.trackingNumber}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Refund Request Section */}
      {(order.status === 'delivered' || order.status === 'cancelled') && orderRefunds.length === 0 && (
        <div className="card p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="w-5 h-5 text-orange-600" />
            <h2 className="font-bold">Request a Refund</h2>
          </div>
          {!showRefundForm ? (
            <button onClick={() => { setShowRefundForm(true); setRefundAmount(order.total) }} className="btn-secondary text-sm flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Request Refund
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Refund Amount (max {formatMoney(order.total)})</label>
                <input
                  type="number"
                  min="0"
                  max={order.total}
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Math.min(parseFloat(e.target.value) || 0, order.total))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Reason for Refund *</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Describe why you are requesting a refund..."
                  rows={3}
                  className="input-field resize-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!refundReason.trim()) return
                    requestRefund({
                      orderId: order.id,
                      buyerId: user.id,
                      buyerName: user.name,
                      sellerId,
                      amount: refundAmount,
                      reason: refundReason.trim(),
                    })
                    setShowRefundForm(false)
                    setRefundReason('')
                    setRefundAmount(order.total)
                    toast.success('Refund request submitted. Admin will review shortly.')
                  }}
                  disabled={!refundReason.trim()}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  Submit Refund Request
                </button>
                <button onClick={() => { setShowRefundForm(false); setRefundReason('') }} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {orderRefunds.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="font-bold mb-3 flex items-center gap-2"><RotateCcw className="w-5 h-5 text-orange-600" /> Refund Requests</h2>
          <div className="space-y-2">
            {orderRefunds.map(ref => (
              <div key={ref.id} className={`p-4 rounded-lg text-sm ${ref.status === 'approved' ? 'bg-green-50 border border-green-200' : ref.status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{ref.id} — {formatMoney(ref.amount)}</p>
                    <p className="text-gray-600 mt-1">{ref.reason}</p>
                    {ref.adminNote && <p className="text-xs mt-1 text-gray-500 italic">Admin note: {ref.adminNote}</p>}
                  </div>
                  <span className={`badge capitalize ${ref.status === 'approved' ? 'badge-green' : ref.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>{ref.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messaging / Dispute Section */}
      <div className="card">
        <div className="p-4 border-b flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-600" />
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
            orderMessages.map(msg => {
              const isSystem = msg.senderRole === 'system' || msg.senderId === 'system-auto'
              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <div className="max-w-[85%] rounded-xl p-3 bg-gradient-to-r from-amber-50 to-green-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-amber-700">{msg.senderName}</span>
                      </div>
                      <p className="text-sm text-blue-800">{msg.text}</p>
                      <p className="text-xs text-blue-400 mt-1">{formatTimestamp(msg.timestamp)}</p>
                    </div>
                  </div>
                )
              }
              return (
                <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg p-3 ${msg.senderId === user.id ? 'bg-amber-600 text-white' : 'bg-gray-100'} ${msg.isDispute ? 'ring-2 ring-red-400' : ''}`}>
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
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setIsDispute(false)}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${!isDispute ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
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
