import { useState } from 'react'
import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'
import { useSettings } from '../../context/SettingsContext'
import { MessageSquare, Flag, Eye, EyeOff, CheckCircle, AlertTriangle, Search } from 'lucide-react'

export default function ReviewModeration() {
  const { reviews, products, moderateReview } = useDataStore()
  const { formatMoney } = useSettings()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = reviews.filter(r => {
    const matchFilter = filter === 'all' || (filter === 'flagged' && r.flagged) || (filter === 'hidden' && r.moderated) || (filter === 'active' && !r.moderated && !r.flagged)
    const matchSearch = !search || r.comment?.toLowerCase().includes(search.toLowerCase()) || r.buyerName?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const stats = {
    total: reviews.length,
    flagged: reviews.filter(r => r.flagged).length,
    hidden: reviews.filter(r => r.moderated).length,
    active: reviews.filter(r => !r.moderated && !r.flagged).length,
  }

  return (
    <div>
      <h1 className="page-title">Review Moderation</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Reviews', value: stats.total, color: 'bg-amber-50 text-amber-700' },
          { label: 'Active', value: stats.active, color: 'bg-green-50 text-green-700' },
          { label: 'Flagged', value: stats.flagged, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Hidden', value: stats.hidden, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm opacity-75">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="search" placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'flagged', 'hidden'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-sm rounded-lg font-medium capitalize transition ${filter === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No reviews found.</p>
            </div>
          ) : (
            filtered.map(review => {
              const product = products.find(p => p.id === review.productId)
              return (
                <div key={review.id} className={`p-4 ${review.flagged ? 'bg-yellow-50' : review.moderated ? 'bg-red-50 opacity-75' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{review.buyerName || 'Anonymous'}</span>
                        <span className="text-xs text-gray-500">{review.date}</span>
                        {review.flagged && <span className="badge badge-yellow text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Flagged</span>}
                        {review.moderated && <span className="badge badge-red text-xs">Hidden</span>}
                      </div>
                      {product && <p className="text-xs text-gray-500 mb-1">Product: {product.name}</p>}
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={`text-sm ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>{star <= review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!review.flagged && (
                        <button onClick={() => { moderateReview(review.id, 'flag'); toast.success('Review flagged') }} className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded" title="Flag review">
                          <Flag className="w-4 h-4" />
                        </button>
                      )}
                      {!review.moderated ? (
                        <button onClick={() => { moderateReview(review.id, 'hide'); toast.success('Review hidden') }} className="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Hide review">
                          <EyeOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => { moderateReview(review.id, 'show'); toast.success('Review restored') }} className="p-1.5 text-green-600 hover:bg-green-100 rounded" title="Restore review">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
