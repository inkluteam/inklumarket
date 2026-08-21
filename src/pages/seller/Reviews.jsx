import { useState } from 'react'
import { Star, Search, Filter } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'
import { useAuth } from '../../context/AuthContext'

function Stars({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} fill={i <= rating ? '#f59e0b' : 'none'} color={i <= rating ? '#f59e0b' : '#d1d5db'} />
      ))}
    </span>
  )
}

export default function SellerReviews() {
  const { user } = useAuth()
  const { reviews, sellers, products } = useDataStore()
  const [search, setSearch] = useState('')
  const [filterRating, setFilterRating] = useState('all')

  const mySeller = sellers.find(s => s.email === user?.email)
  const myProductIds = new Set(products.filter(p => p.sellerId === mySeller?.id).map(p => p.id))

  const myReviews = reviews
    .filter(r => myProductIds.has(r.productId))
    .filter(r => filterRating === 'all' || String(r.rating) === filterRating)
    .filter(r => !search || r.userName?.toLowerCase().includes(search.toLowerCase()) || r.comment?.toLowerCase().includes(search.toLowerCase()))

  const avg = myReviews.length > 0 ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1) : '—'

  const breakdown = [5,4,3,2,1].map(n => ({
    star: n,
    count: myReviews.filter(r => r.rating === n).length,
  }))

  return (
    <main id="main-content" style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Star size={22} /> Customer Reviews
      </h1>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '2rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', minWidth: 90 }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary,#0047AB)', lineHeight: 1 }}>{avg}</div>
          <Stars rating={Math.round(parseFloat(avg) || 0)} />
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>{myReviews.length} review{myReviews.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          {breakdown.map(({ star, count }) => (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
              <span style={{ fontSize: '0.75rem', width: 14, textAlign: 'right' }}>{star}</span>
              <Star size={11} fill="#f59e0b" color="#f59e0b" />
              <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#f59e0b', width: myReviews.length ? `${(count / myReviews.length) * 100}%` : '0%', borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', width: 20 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews…" style={{ width: '100%', paddingLeft: '2.25rem', padding: '0.5rem 0.75rem 0.5rem 2.25rem', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem' }} />
        </div>
        <select value={filterRating} onChange={e => setFilterRating(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem', background: '#fff' }}>
          <option value="all">All Stars</option>
          {[5,4,3,2,1].map(n => <option key={n} value={String(n)}>{n} Star{n !== 1 ? 's' : ''}</option>)}
        </select>
      </div>

      {/* Reviews list */}
      {myReviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <Star size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
          <p>No reviews match your filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myReviews.map(review => {
            const product = products.find(p => p.id === review.productId)
            return (
              <div key={review.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{review.userName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{product?.name || 'Product'} · {review.date}</div>
                  </div>
                  <Stars rating={review.rating} />
                </div>
                {review.comment && <p style={{ marginTop: '0.625rem', fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>{review.comment}</p>}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
