import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDataStore } from '../../context/DataStore'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function BuyerWishlist() {
  const { user } = useAuth()
  const { products, getWishlistByUser, removeFromWishlist } = useDataStore()
  const { addToCart } = useCart()

  const wishlistItems = getWishlistByUser ? getWishlistByUser(user?.id) : []
  const wishlistProducts = wishlistItems
    .map(w => ({ ...w, product: products.find(p => p.id === w.productId) }))
    .filter(w => w.product)

  return (
    <main id="main-content" className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Heart size={22} /> My Wishlist
        <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6b7280' }}>({wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''})</span>
      </h1>

      {wishlistProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
          <Heart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Your wishlist is empty</h2>
          <p style={{ marginBottom: '1.5rem' }}>Save products you love and come back later.</p>
          <Link to="/catalog" style={{ display: 'inline-block', background: 'var(--color-primary, #0047AB)', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {wishlistProducts.map(({ id: wishId, product, productId }) => (
            <div key={wishId} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <Link to={`/product/${productId}`} style={{ display: 'block', height: 200, overflow: 'hidden' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Link>
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to={`/product/${productId}`} style={{ fontWeight: 600, textDecoration: 'none', color: 'inherit', fontSize: '0.95rem' }}>{product.name}</Link>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{product.seller}</div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary, #0047AB)', fontSize: '1rem' }}>₱{product.price.toFixed(2)}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    onClick={() => addToCart && addToCart({ ...product, quantity: 1 })}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: 'var(--color-primary, #0047AB)', color: '#fff', border: 'none', borderRadius: 7, padding: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(user?.id, productId)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '0.5rem 0.75rem', cursor: 'pointer' }}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
