import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useDataStore } from '../context/DataStore'
import { useSettings } from '../context/SettingsContext'
import { ShoppingCart, User, Menu, X, Search, Clock, TrendingUp, Sparkles } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

const RECENT_KEY = 'im_recent_searches'

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}

function saveRecentSearch(query) {
  const recent = getRecentSearches().filter(r => r !== query)
  recent.unshift(query)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8)))
}

function highlightMatch(text, query) {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) => regex.test(part) ? <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">{part}</mark> : part)
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const { products, smartSearch } = useDataStore()
  const { formatMoney } = useSettings()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState(getRecentSearches)
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value)
    setActiveIndex(-1)
    if (value.trim().length > 0) {
      const results = smartSearch(value, 6)
      setSuggestions(results)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(true)
    }
  }, [smartSearch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim())
      setRecentSearches(getRecentSearches())
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (product) => {
    saveRecentSearch(searchQuery.trim() || product.name)
    setRecentSearches(getRecentSearches())
    navigate(`/product/${product.id}`)
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const selectRecent = (query) => {
    setSearchQuery(query)
    handleSearch({ preventDefault: () => {} })
  }

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY)
    setRecentSearches([])
  }

  const handleKeyDown = (e) => {
    const items = suggestions.length > 0 ? suggestions : []
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) {
      e.preventDefault()
      selectSuggestion(items[activeIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const trendingProducts = products.filter(p => p.featured && p.rating >= 4.5).slice(0, 3)

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2" aria-label="Inclusive Market Home">
            <span className="text-2xl">♿</span>
            <span className="text-xl font-bold text-blue-600">Inclusive Market</span>
          </Link>

          <div ref={searchRef} className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <form onSubmit={handleSearch} className="w-full relative" role="search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                placeholder="Search products, sellers, categories..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search products"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
                aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
              />
            </form>

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto" role="listbox">
                {/* Search Results */}
                {suggestions.length > 0 && (
                  <>
                    <div className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wider px-4 pt-3 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Smart Results
                    </div>
                    {suggestions.map((p, idx) => (
                      <button
                        key={p.id}
                        id={`search-item-${idx}`}
                        onClick={() => selectSuggestion(p)}
                        className={`w-full flex items-center gap-3 px-4 py-2 transition-colors text-left ${activeIndex === idx ? 'bg-blue-100' : 'hover:bg-blue-50'}`}
                        role="option"
                        aria-selected={activeIndex === idx}
                      >
                        <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{highlightMatch(p.name, searchQuery)}</p>
                          <p className="text-xs text-gray-500">{p.seller} · {p.category}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{formatMoney(p.price)}</span>
                      </button>
                    ))}
                    <Link
                      to={`/catalog?search=${encodeURIComponent(searchQuery)}`}
                      className="block text-center py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium border-t"
                      onClick={() => { saveRecentSearch(searchQuery); setShowSuggestions(false) }}
                    >
                      View all results for &quot;{searchQuery}&quot;
                    </Link>
                  </>
                )}

                {/* Recent Searches */}
                {suggestions.length === 0 && recentSearches.length > 0 && (
                  <>
                    <div className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wider px-4 pt-3 flex items-center justify-between">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Recent Searches</span>
                      <button onClick={clearRecent} className="text-blue-500 hover:text-blue-700 normal-case tracking-normal">Clear</button>
                    </div>
                    {recentSearches.map((query, idx) => (
                      <button key={idx} onClick={() => selectRecent(query)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-400" /> {query}
                      </button>
                    ))}
                  </>
                )}

                {/* Trending */}
                {suggestions.length === 0 && recentSearches.length === 0 && (
                  <>
                    <div className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wider px-4 pt-3 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Trending Now
                    </div>
                    {trendingProducts.map(p => (
                      <button key={p.id} onClick={() => selectSuggestion(p)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors text-left">
                        <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.seller} · ★ {p.rating}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{formatMoney(p.price)}</span>
                      </button>
                    ))}
                  </>
                )}

                {suggestions.length === 0 && recentSearches.length === 0 && trendingProducts.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-400">Start typing to search...</div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/catalog" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Catalog</Link>

            {user ? (
              <>
                {user.role === 'seller' && <Link to="/seller/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Seller Hub</Link>}
                {user.role === 'admin' && <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Admin</Link>}
                <Link to="/buyer/cart" className="relative text-gray-700 hover:text-blue-600 transition-colors" aria-label={`Shopping cart with ${count} items`}>
                  <ShoppingCart className="w-6 h-6" />
                  {count > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" aria-hidden="true">{count}</span>}
                </Link>
                <div className="flex items-center gap-2">
                  <Link to="/buyer/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </Link>
                  <button onClick={() => { logout(); navigate('/') }} className="text-sm text-gray-500 hover:text-red-600 transition-colors">Logout</button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">Register</Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 text-gray-700" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} role="search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Search products" />
            </div>
          </form>
          <Link to="/catalog" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Catalog</Link>
          {user ? (
            <>
              <Link to="/buyer/cart" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Cart ({count})</Link>
              <Link to="/buyer/profile" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Profile</Link>
              {user.role === 'seller' && <Link to="/seller/dashboard" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Seller Hub</Link>}
              {user.role === 'admin' && <Link to="/admin/dashboard" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Admin</Link>}
              <button onClick={() => { logout(); navigate('/'); setMobileOpen(false) }} className="block py-2 text-red-600 font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="block py-2 text-blue-600 font-medium" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
