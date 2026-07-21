import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const { formatMoney } = useSettings()

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Discover amazing products from PWD-led enterprises</p>
        <Link to="/catalog" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Browse Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="page-title">Shopping Cart</h1>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="card flex flex-col sm:flex-row p-4 gap-4">
            <img src={item.image} alt={item.name} className="w-full sm:w-24 h-24 object-cover rounded-lg" />
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-amber-600">{item.seller}</p>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-1" aria-label={`Remove ${item.name}`}>
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2 hover:bg-gray-100" aria-label="Decrease quantity">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-100" aria-label="Increase quantity">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-lg font-bold text-green-600">{formatMoney(item.price * item.quantity)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span className="text-xl font-bold">{formatMoney(total)}</span>
        </div>
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>Shipping</span>
          <span className="text-green-600 font-semibold">Free</span>
        </div>
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-bold text-green-600">{formatMoney(total)}</span>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={clearCart} className="btn-outline flex-1">Clear Cart</button>
          <Link to="/buyer/checkout" className="btn-primary flex-1 text-center">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  )
}
