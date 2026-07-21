import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, Heart, Truck, Users, Star, ShoppingBag, TrendingUp, Sparkles, Clock } from 'lucide-react'
import { useDataStore } from '../context/DataStore'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

function ProductCard({ product, formatMoney, onAddToCart }) {
  return (
    <div className="card group">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        </Link>
        <span className="badge badge-green absolute top-3 left-3">{product.accessibility}</span>
        {product.featured && <span className="badge badge-yellow absolute bottom-3 right-3">Featured</span>}
      </div>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <p className="text-sm text-amber-600 font-medium">{product.seller}</p>
          <h3 className="font-semibold text-gray-900 mt-1 hover:text-amber-600 transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="text-sm text-gray-600">{product.rating} ({product.reviews})</span>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="text-xl font-bold text-green-600">{formatMoney(product.price)}</span>
          <button onClick={() => onAddToCart(product)} className="btn-primary text-sm !py-2 !px-4" aria-label={`Add ${product.name} to cart`}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { products, categories, getTrendingProducts, getNewArrivals } = useDataStore()
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { formatMoney } = useSettings()
  const featured = products.filter(p => p.featured)
  const trending = getTrendingProducts(4)
  const newArrivals = getNewArrivals(4)

  const handleAddToCart = (product) => {
    if (!user) { navigate('/login'); return }
    addItem(product)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-600 via-amber-700 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Shop with Purpose.<br />
              <span className="text-green-200">Empower AVRC Region IX.</span>
            </h1>
            <p className="text-lg md:text-xl text-amber-100 mb-8 leading-relaxed">
              Discover unique, high-quality products from PWD-led enterprises of Zamboanga Peninsula. Every purchase empowers persons with disabilities at AVRC Region IX.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalog" className="inline-flex items-center gap-2 bg-white text-amber-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-amber-50 transition-colors">
                Browse Catalog <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/seller/register-seller" className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors">
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-8 h-8 text-amber-600" aria-hidden="true" />
              <span className="font-semibold text-gray-900">Secure Payments</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" aria-hidden="true" />
              <span className="font-semibold text-gray-900">PWD-Led Sellers</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Truck className="w-8 h-8 text-green-600" aria-hidden="true" />
              <span className="font-semibold text-gray-900">Local Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="w-8 h-8 text-amber-600" aria-hidden="true" />
              <span className="font-semibold text-gray-900">AVRC Region IX</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} to={`/catalog?category=${cat.id}`} className="card p-6 text-center hover:scale-105 transition-transform duration-200 group">
                <span className="text-4xl block mb-3" aria-hidden="true">{cat.icon}</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      {trending.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-orange-500" />
                <h2 className="text-3xl font-bold">Trending Now</h2>
                <span className="badge badge-yellow flex items-center gap-1"><Sparkles className="w-3 h-3" /> Popular</span>
              </div>
              <Link to="/catalog" className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map(product => (
                <ProductCard key={product.id} product={product} formatMoney={formatMoney} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/catalog" className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} formatMoney={formatMoney} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <Clock className="w-7 h-7 text-amber-500" />
                <h2 className="text-3xl font-bold">New Arrivals</h2>
                <span className="badge badge-blue flex items-center gap-1"><Sparkles className="w-3 h-3" /> Just In</span>
              </div>
              <Link to="/catalog" className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} formatMoney={formatMoney} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Join Zamboanga Peninsula's growing community of conscious consumers and empowered PWD sellers from AVRC Region IX. Together, we build a marketplace where everyone belongs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition-colors">
              Create Account
            </Link>
            <Link to="/seller/register-seller" className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors">
              Sell on Inclusive Market
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
