import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useDataStore } from '../context/DataStore'
import { useSettings } from '../context/SettingsContext'
import { ShoppingCart, Menu, X, Search, Clock, TrendingUp, Sparkles, ChevronDown, LayoutDashboard, Store, UserCircle, Building2, BookOpen, ShoppingBag, Heart, LogOut, LogIn, UserPlus, Bell } from 'lucide-react'
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

/* Vinta sail mark — the iconic striped sail of Zamboanga */
function VintaMark({ size = 34 }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block rounded-lg shadow-sm"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg,#E6397E 0%,#E6397E 20%,#F4795B 20%,#F4795B 40%,#F2B705 40%,#F2B705 60%,#0E7490 60%,#0E7490 80%,#15803D 80%)',
        clipPath: 'polygon(50% 0, 100% 78%, 62% 78%, 62% 100%, 38% 100%, 38% 78%, 0 78%)',
      }}
    />
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const { products, categories, smartSearch, getNotificationsForUser } = useDataStore()
  const unreadCount = user && getNotificationsForUser ? (getNotificationsForUser(user.id) || []).filter(n => !n.isRead).length : 0
  const { formatMoney } = useSettings()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState(getRecentSearches)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [openMenu, setOpenMenu] = useState(null) // 'shop' | 'company' | null
  const [acctOpen, setAcctOpen] = useState(false)
  const searchRef = useRef(null)
  const inputRef = useRef(null)
  const menuRef = useRef(null)
  const acctRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false)
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null)
      if (acctRef.current && !acctRef.current.contains(e.target)) setAcctOpen(false)
    }
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

  // Role-aware destinations for the second-row strip
  const dashboardTo = user?.role === 'seller' ? '/seller/dashboard'
    : user?.role === 'admin' ? '/admin/dashboard'
    : user ? '/buyer/orders' : '/login'
  const accountTo = user ? '/buyer/profile' : '/login'

  const navLinkCls = "flex items-center gap-1.5 px-3 py-2.5 text-[15px] font-semibold text-sky-50 hover:text-white hover:bg-white/10 rounded-t transition-colors border-b-[3px] border-transparent hover:border-[#F2B705]"

  return (
    <nav className="sticky top-0 z-50 shadow-md" role="navigation" aria-label="Main navigation">
      {/* ── Row 1 · brand + search + account ─────────────────── */}
      <div className="bg-gradient-to-r from-[#FDF1F3] via-[#FBEFF2] to-[#FDF4EC] border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2.5" aria-label="Inclusive Market Home">
              <VintaMark />
              <span>
                <span className="block text-xl font-extrabold leading-tight" style={{ color: '#9D174D' }}>Inclusive Market</span>
                <span className="block text-[10.5px] font-bold tracking-[0.18em] uppercase" style={{ color: '#0E7490' }}>Zamboanga · Asia's Latin City</span>
              </span>
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
                  className="w-full pl-10 pr-4 py-2 bg-white/90 border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  aria-label="Search products"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                  aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
                />
              </form>

              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#FFFBF8] rounded-lg shadow-lg border border-rose-100 z-50 max-h-96 overflow-y-auto" role="listbox">
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
                          className={`w-full flex items-center gap-3 px-4 py-2 transition-colors text-left ${activeIndex === idx ? 'bg-rose-100' : 'hover:bg-rose-50'}`}
                          role="option"
                          aria-selected={activeIndex === idx}
                        >
                          <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{highlightMatch(p.name, searchQuery)}</p>
                            <p className="text-xs text-gray-500">{p.seller} · {p.category}</p>
                          </div>
                          <span className="text-sm font-bold text-green-600">{formatMoney(p.price)}</span>
                        </button>
                      ))}
                      <Link
                        to={`/catalog?search=${encodeURIComponent(searchQuery)}`}
                        className="block text-center py-2 text-sm text-pink-700 hover:bg-rose-50 font-medium border-t border-rose-100"
                        onClick={() => { saveRecentSearch(searchQuery); setShowSuggestions(false) }}
                      >
                        View all results for &quot;{searchQuery}&quot;
                      </Link>
                    </>
                  )}

                  {suggestions.length === 0 && recentSearches.length > 0 && (
                    <>
                      <div className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wider px-4 pt-3 flex items-center justify-between">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Recent Searches</span>
                        <button onClick={clearRecent} className="text-pink-600 hover:text-pink-800 normal-case tracking-normal">Clear</button>
                      </div>
                      {recentSearches.map((query, idx) => (
                        <button key={idx} onClick={() => selectRecent(query)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-400" /> {query}
                        </button>
                      ))}
                    </>
                  )}

                  {suggestions.length === 0 && recentSearches.length === 0 && (
                    <>
                      <div className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wider px-4 pt-3 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Trending Now
                      </div>
                      {trendingProducts.map(p => (
                        <button key={p.id} onClick={() => selectSuggestion(p)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-rose-50 transition-colors text-left">
                          <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.seller} · ★ {p.rating}</p>
                          </div>
                          <span className="text-sm font-bold text-green-600">{formatMoney(p.price)}</span>
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
              {user?.role === 'buyer' && (
                <Link to="/buyer/cart" className="relative text-gray-700 hover:text-pink-700 transition-colors" aria-label={`Shopping cart with ${count} items`}>
                  <ShoppingCart className="w-6 h-6" />
                  {count > 0 && <span className="absolute -top-2 -right-2 bg-[#E6397E] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" aria-hidden="true">{count}</span>}
                </Link>
              )}

              {user && (
                <Link to="/notifications" className="relative text-gray-700 hover:text-pink-700 transition-colors" aria-label={`Notifications, ${unreadCount} unread`}>
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[.65rem] font-bold min-w-[1.15rem] h-[1.15rem] px-1 rounded-full flex items-center justify-center" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </Link>
              )}

              {/* ── Unified Account control ─────────────────── */}
              <div className="relative" ref={acctRef}>
                <button
                  onClick={() => setAcctOpen(!acctOpen)}
                  aria-expanded={acctOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-rose-100/70 transition-colors"
                >
                  {user ? (
                    <>
                      <span
                        className="w-9 h-9 rounded-full grid place-items-center text-white font-extrabold text-base overflow-hidden ring-2 ring-[#F2B705] shadow-sm"
                        style={{ background: 'linear-gradient(135deg,#E6397E,#F4795B)' }}
                        aria-hidden="true"
                      >
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          : (user.name || 'U').trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 max-w-[110px] truncate">{(user.name || 'Account').split(' ')[0]}</span>
                    </>
                  ) : (
                    <>
                      <UserCircle className="w-7 h-7 text-gray-700" />
                      <span className="text-sm font-semibold text-gray-800">Account</span>
                    </>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${acctOpen ? 'rotate-180' : ''}`} />
                </button>

                {acctOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-[#FFFBF8] rounded-xl shadow-xl border border-rose-100 py-2 z-50" role="menu">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-rose-100">
                          <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 badge badge-blue capitalize">{user.role}</span>
                        </div>
                        <Link to={dashboardTo} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setAcctOpen(false)}>
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to={accountTo} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setAcctOpen(false)}>
                          <UserCircle className="w-4 h-4" /> My Profile
                        </Link>
                        {user && (
                          <Link to="/notifications" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setAcctOpen(false)}>
                            <Bell className="w-4 h-4" /> Notifications
                            {unreadCount > 0 && <span className="ml-auto bg-blue-600 text-white text-[.65rem] font-bold min-w-[1.15rem] h-[1.15rem] px-1 rounded-full grid place-items-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                          </Link>
                        )}
                        {user.role === 'buyer' && (
                          <Link to="/buyer/wishlist" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setAcctOpen(false)}>
                            <Heart className="w-4 h-4" /> Wishlist
                          </Link>
                        )}
                        <div className="border-t border-rose-100 my-1.5" />
                        <button onClick={() => { logout(); navigate('/'); setAcctOpen(false) }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#E6397E] hover:bg-rose-50">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setAcctOpen(false)}>
                          <LogIn className="w-4 h-4" /> Login
                        </Link>
                        <Link to="/register" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setAcctOpen(false)}>
                          <UserPlus className="w-4 h-4" /> Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button className="md:hidden p-2 text-gray-700" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Vinta stripe divider ─────────────────────────────── */}
      <div aria-hidden="true" className="h-1" style={{ background: 'linear-gradient(90deg,#E6397E 0 20%,#F4795B 20% 40%,#F2B705 40% 60%,#0E7490 60% 80%,#15803D 80% 100%)' }} />

      {/* ── Row 2 · category strip ───────────────────────────── */}
      <div ref={menuRef} className="hidden md:block bg-gradient-to-r from-[#0B3C5D] via-[#0E7490] to-[#0B3C5D]" aria-label="Site sections">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-stretch gap-1">
          <Link to={dashboardTo} className={navLinkCls}>
            <LayoutDashboard className="w-4 h-4 text-[#F2B705]" /> Dashboard
          </Link>
          <Link to="/catalog" className={navLinkCls}>
            <Store className="w-4 h-4 text-[#F4795B]" /> Catalog
          </Link>
          <a href="/docs/" target="_blank" rel="noreferrer" className={navLinkCls}>
            <BookOpen className="w-4 h-4 text-[#F2B705]" /> Docs
          </a>

          <div className="relative">
            <button
              className={`${navLinkCls} w-full`}
              onClick={() => setOpenMenu(openMenu === 'shop' ? null : 'shop')}
              aria-expanded={openMenu === 'shop'}
              aria-haspopup="menu"
            >
              <ShoppingBag className="w-4 h-4 text-[#E6397E]" /> Shop
              <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'shop' ? 'rotate-180' : ''}`} />
            </button>
            {openMenu === 'shop' && (
              <div className="absolute left-0 top-full mt-0 w-64 bg-[#FFFBF8] rounded-b-xl shadow-xl border border-t-0 border-rose-100 py-2 z-50">
                <Link to="/catalog?featured=true" className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setOpenMenu(null)}>✨ Featured Products</Link>
                <div className="border-t border-rose-100 my-1.5" />
                {(categories || []).map(cat => (
                  <Link key={cat.id} to={`/catalog?category=${cat.id}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setOpenMenu(null)}>
                    <span aria-hidden="true">{cat.icon || '🛍️'}</span> {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className={`${navLinkCls} w-full`}
              onClick={() => setOpenMenu(openMenu === 'company' ? null : 'company')}
              aria-expanded={openMenu === 'company'}
              aria-haspopup="menu"
            >
              <Building2 className="w-4 h-4 text-[#5EEAD4]" /> Company
              <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'company' ? 'rotate-180' : ''}`} />
            </button>
            {openMenu === 'company' && (
              <div className="absolute left-0 top-full mt-0 w-64 bg-[#FFFBF8] rounded-b-xl shadow-xl border border-t-0 border-rose-100 py-2 z-50">
                <Link to="/static/about" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setOpenMenu(null)}>About Us</Link>
                <Link to="/static/contact" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setOpenMenu(null)}>Contact</Link>
                <Link to="/static/faq" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setOpenMenu(null)}>FAQ</Link>
                <Link to="/static/accessibility" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setOpenMenu(null)}>Accessibility</Link>
                <Link to="/static/privacy" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setOpenMenu(null)}>Privacy Policy</Link>
                <Link to="/static/terms" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-pink-700" onClick={() => setOpenMenu(null)}>Terms of Service</Link>
              </div>
            )}
          </div>

          <Link to={accountTo} className={navLinkCls}>
            <UserCircle className="w-4 h-4 text-[#A5F3FC]" /> Account
          </Link>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FFFBF8] border-b-4 border-[#F2B705] px-4 py-4 space-y-1">
          <form onSubmit={handleSearch} role="search" className="mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500" aria-label="Search products" />
            </div>
          </form>
          <Link to="/" className="block py-2 text-gray-800 font-semibold" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to={dashboardTo} className="block py-2 text-gray-800 font-semibold" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          <Link to="/catalog" className="block py-2 text-gray-800 font-semibold" onClick={() => setMobileOpen(false)}>Catalog</Link>
          <p className="pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Shop by category</p>
          {(categories || []).map(cat => (
            <Link key={cat.id} to={`/catalog?category=${cat.id}`} className="block py-1.5 pl-3 text-gray-700" onClick={() => setMobileOpen(false)}>
              {cat.icon || '🛍️'} {cat.name}
            </Link>
          ))}
          <Link to="/catalog?featured=true" className="block py-1.5 pl-3 text-pink-700 font-medium" onClick={() => setMobileOpen(false)}>✨ Featured Products</Link>
          <p className="pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Company</p>
          <Link to="/static/about" className="block py-1.5 pl-3 text-gray-700" onClick={() => setMobileOpen(false)}>About Us</Link>
          <Link to="/static/contact" className="block py-1.5 pl-3 text-gray-700" onClick={() => setMobileOpen(false)}>Contact</Link>
          <Link to="/static/faq" className="block py-1.5 pl-3 text-gray-700" onClick={() => setMobileOpen(false)}>FAQ</Link>
          <a href="/docs/" target="_blank" rel="noreferrer" className="block py-1.5 pl-3 text-pink-700 font-semibold" onClick={() => setMobileOpen(false)}>Chapter 3 Docs ↗</a>
          <p className="pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Account</p>
          {user ? (
            <>
              {user.role === 'buyer' && <Link to="/buyer/cart" className="block py-1.5 pl-3 text-gray-700" onClick={() => setMobileOpen(false)}>Cart ({count})</Link>}
              <Link to={accountTo} className="block py-1.5 pl-3 text-gray-700" onClick={() => setMobileOpen(false)}>Profile ({user.name})</Link>
              <button onClick={() => { logout(); navigate('/'); setMobileOpen(false) }} className="block py-2 pl-3 text-[#E6397E] font-semibold">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-1.5 pl-3 text-gray-700" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="block py-1.5 pl-3 text-pink-700 font-semibold" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
