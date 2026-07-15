import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { useDataStore } from '../context/DataStore'
import { Search, Star, Filter, ShoppingCart, Grid, List, X, SlidersHorizontal } from 'lucide-react'

export default function Catalog() {
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState('grid')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { formatMoney } = useSettings()
  const { products, categories } = useDataStore()

  const handleAddToCart = (product) => {
    if (!user) { navigate('/login'); return }
    addItem(product)
  }

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return products.filter(p => {
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.seller || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      const matchesCategory = !selectedCategory || p.category === selectedCategory
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
      const matchesRating = p.rating >= minRating
      return matchesSearch && matchesCategory && matchesPrice && matchesRating
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price
        case 'price-high': return b.price - a.price
        case 'rating': return b.rating - a.rating
        case 'newest': return (b.dateAdded || '').localeCompare(a.dateAdded || '')
        case 'name': return a.name.localeCompare(b.name)
        case 'popular': return (b.reviews * b.rating) - (a.reviews * a.rating)
        default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      }
    })
  }, [products, searchQuery, selectedCategory, sortBy, priceRange, minRating])

  const hasActiveFilters = selectedCategory || minRating > 0 || priceRange[0] > 0 || priceRange[1] < 10000

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setPriceRange([0, 10000])
    setMinRating(0)
    setSortBy('featured')
  }

  const prices = products.map(p => p.price)
  const maxPrice = Math.ceil(Math.max(...prices, 100) / 100) * 100

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="page-title">Product Catalog</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="card p-4 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categories
              </h3>
              <div className="space-y-2">
                <button onClick={() => setSelectedCategory('')} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  All Categories
                </button>
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat.id).length
                  return (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <span className="mr-2">{cat.icon}</span>{cat.name} <span className="text-gray-400">({count})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="input-field text-sm !py-1.5" placeholder="Min" min="0" />
                  <span className="text-gray-400 self-center">-</span>
                  <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="input-field text-sm !py-1.5" placeholder="Max" min="0" />
                </div>
                <input type="range" min="0" max={maxPrice} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full" />
                <p className="text-xs text-gray-500">{formatMoney(priceRange[0])} - {formatMoney(priceRange[1])}</p>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Minimum Rating</h3>
              <div className="space-y-2">
                {[0, 3, 4, 4.5].map(r => (
                  <button key={r} onClick={() => setMinRating(r)} className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${minRating === r ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {r === 0 ? 'All Ratings' : (
                      <>
                        <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < Math.round(r) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div>
                        <span>{r}+ stars</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="w-full text-center text-sm text-red-600 hover:text-red-700 font-semibold py-2">
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="search" placeholder="Search products, sellers, descriptions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field w-auto">
              <option value="featured">Featured First</option>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
            </select>
            <div className="flex gap-1">
              <button onClick={() => setViewMode('grid')} className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`} aria-label="Grid view">
                <Grid className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`} aria-label="List view">
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active filters bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                  {minRating}+ stars <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  {formatMoney(priceRange[0])} - {formatMoney(priceRange[1])}
                  <button onClick={() => setPriceRange([0, 10000])}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <button onClick={clearAllFilters} className="text-blue-600 hover:text-blue-700 mt-2 font-semibold">
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(product => (
                <div key={product.id} className="card group">
                  <Link to={`/product/${product.id}`}>
                    <div className="relative overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      {product.featured && <span className="badge badge-yellow absolute top-3 left-3">Featured</span>}
                      {product.stock <= 5 && product.stock > 0 && <span className="badge badge-red absolute top-3 right-3">Low Stock</span>}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <p className="text-sm text-blue-600 font-medium">{product.seller}</p>
                      <h3 className="font-semibold text-gray-900 mt-1 hover:text-blue-600 transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm text-gray-600">{product.rating} ({product.reviews})</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xl font-bold text-emerald-600">{formatMoney(product.price)}</span>
                      <button onClick={() => handleAddToCart(product)} className="btn-primary text-sm !py-2 !px-4" aria-label={`Add ${product.name} to cart`}>
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(product => (
                <div key={product.id} className="card flex flex-col sm:flex-row overflow-hidden">
                  <Link to={`/product/${product.id}`} className="sm:w-48 shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-48 sm:h-full object-cover" loading="lazy" />
                  </Link>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">{product.seller}</p>
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">{product.name}</h3>
                        </Link>
                      </div>
                      <span className="text-2xl font-bold text-emerald-600">{formatMoney(product.price)}</span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">{product.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm text-gray-600">{product.rating} ({product.reviews} reviews)</span>
                        <span className="badge badge-green ml-2">{product.accessibility}</span>
                      </div>
                      <button onClick={() => handleAddToCart(product)} className="btn-primary text-sm !py-2">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
