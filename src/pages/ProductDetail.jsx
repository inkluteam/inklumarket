import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { useDataStore } from '../context/DataStore'
import { useToast } from '../context/ToastContext'
import { Star, ShoppingCart, ArrowLeft, Truck, Shield, Heart, Minus, Plus, Sparkles, Brain } from 'lucide-react'
import { useState, useCallback } from 'react'
import SpeakButton from '../components/SpeakButton'

function getWishlist() {
  try { return JSON.parse(localStorage.getItem('im_wishlist') || '[]') } catch { return [] }
}

export default function ProductDetail() {
  const { id } = useParams()
  const { products, getProductReviews, getSmartRecommendations } = useDataStore()
  const product = products.find(p => p.id === id)
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { formatMoney } = useSettings()
  const toast = useToast()
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(() => getWishlist().includes(id))

  const toggleWishlist = useCallback(() => {
    if (!user) { navigate('/login'); return }
    const current = getWishlist()
    let next
    if (current.includes(id)) {
      next = current.filter(wid => wid !== id)
      toast.success('Removed from wishlist')
    } else {
      next = [...current, id]
      toast.success('Added to wishlist!')
    }
    localStorage.setItem('im_wishlist', JSON.stringify(next))
    setWishlisted(next.includes(id))
  }, [id, user, navigate, toast])

  const handleAddToCart = (item, qty = 1) => {
    if (!user) { navigate('/login'); return }
    addItem(item, qty)
    toast.success(`${item.name} added to cart!`)
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/catalog" className="text-blue-600 hover:text-blue-700">Back to Catalog</Link>
      </div>
    )
  }

  const reviews = getProductReviews(product.id)
  const recommendations = getSmartRecommendations(product.id, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-label="Product details">
      <Link to="/catalog" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img src={product.image} alt={product.name} className="w-full h-96 object-cover rounded-xl shadow-lg" role="img" />
          <div className="mt-4 flex items-center gap-2">
            <span className="badge badge-green">{product.accessibility}</span>
            {product.featured && <span className="badge badge-yellow">Featured</span>}
          </div>
        </div>

        <div>
          <p className="text-blue-600 font-semibold">{product.seller}</p>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <SpeakButton
              text={`${product.name}. ${product.description}. Price: ${formatMoney(product.price)}. Rating: ${product.rating} out of 5 stars. ${product.stock > 10 ? 'In stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of stock'}. Accessibility: ${product.accessibility}`}
              label={`Read ${product.name} details aloud`}
            />
          </div>

          <div className="flex items-center gap-2 mt-3" role="img" aria-label={`Rating: ${product.rating} out of 5 stars, ${product.reviews} reviews`}>
            <div className="flex" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-gray-600">{product.rating} ({product.reviews} reviews)</span>
          </div>

          <p className="text-4xl font-bold text-emerald-600 mt-6">{formatMoney(product.price)}</p>
          <p className="text-gray-600 mt-4 leading-relaxed" aria-label="Product description">{product.description}</p>

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500" role="status" aria-live="polite">
            <span className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} aria-hidden="true" />
            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg" role="group" aria-label="Quantity selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Decrease quantity"><Minus className="w-4 h-4" /></button>
              <span className="px-4 font-semibold" aria-live="polite" aria-label={`Quantity: ${quantity}`}>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Increase quantity"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="mt-6 flex gap-3" role="group" aria-label="Purchase actions">
            <button onClick={() => { handleAddToCart(product, quantity); setQuantity(1) }} className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={product.stock === 0} aria-label={product.stock === 0 ? 'Out of stock' : `Add ${quantity} ${product.name} to cart`}>
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button onClick={toggleWishlist} className={`btn-outline flex items-center justify-center gap-2 ${wishlisted ? 'border-red-300 bg-red-50' : ''}`} aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600"><Truck className="w-5 h-5 text-blue-600" /><span>Free local delivery</span></div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Shield className="w-5 h-5 text-blue-600" /><span>Secure checkout</span></div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Heart className="w-5 h-5 text-blue-600" /><span>Support PWD sellers</span></div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{review.userName[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.userName}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        )}
      </section>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold">You Might Also Like</h2>
            <span className="badge badge-blue flex items-center gap-1"><Sparkles className="w-3 h-3" /> Smart Picks</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map(p => (
              <div key={p.id} className="card">
                <Link to={`/product/${p.id}`}>
                  <img src={p.image} alt={p.name} className="w-full h-40 object-cover" loading="lazy" />
                </Link>
                <div className="p-4">
                  <Link to={`/product/${p.id}`}>
                    <h3 className="font-semibold hover:text-blue-600 transition-colors">{p.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-gray-500">{p.rating}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-emerald-600">{formatMoney(p.price)}</span>
                    <button onClick={() => handleAddToCart(p)} className="btn-primary text-sm !py-1.5 !px-3" aria-label={`Add ${p.name} to cart`}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
