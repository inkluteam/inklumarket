import { useState } from 'react'
import { CreditCard, ToggleLeft, ToggleRight, Save, Percent } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'

const PROVIDER_LOGOS = {
  cod: '💵', gcash: '📱', maya: '💙', paymongo: '🟢', stripe: '💳', paypal: '🅿️',
}

export default function AdminPayments() {
  const { paymentProviders, updatePaymentProvider } = useDataStore()
  const [edited, setEdited] = useState({})
  const [saved, setSaved] = useState(false)

  const providers = paymentProviders || []

  function handleToggle(id, current) {
    updatePaymentProvider(id, { enabled: !current })
  }

  function handleFeeChange(id, value) {
    setEdited(prev => ({ ...prev, [id]: value }))
  }

  function handleSaveFee(id) {
    const fee = parseFloat(edited[id])
    if (isNaN(fee) || fee < 0) return
    updatePaymentProvider(id, { fee })
    setEdited(prev => { const n = { ...prev }; delete n[id]; return n })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main id="main-content" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={22} /> Payment Providers
        </h1>
        {saved && <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.35rem 0.85rem', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600 }}>✓ Saved</span>}
      </div>

      <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Enable or disable payment methods available to buyers at checkout. Adjust transaction fee percentages per provider.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {providers.map(p => (
          <div key={p.id} style={{ background: '#fff', border: `2px solid ${p.enabled ? 'var(--color-primary,#0047AB)' : '#e5e7eb'}`, borderRadius: 12, padding: '1.25rem', transition: 'border-color 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{PROVIDER_LOGOS[p.id] || '💳'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: p.enabled ? '#10b981' : '#9ca3af', fontWeight: 600 }}>{p.enabled ? 'ACTIVE' : 'DISABLED'}</div>
                </div>
              </div>
              <button
                onClick={() => handleToggle(p.id, p.enabled)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.enabled ? 'var(--color-primary,#0047AB)' : '#9ca3af' }}
                aria-label={p.enabled ? `Disable ${p.name}` : `Enable ${p.name}`}
              >
                {p.enabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Percent size={14} color="#6b7280" />
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Transaction fee</span>
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={edited[p.id] !== undefined ? edited[p.id] : p.fee}
                onChange={e => handleFeeChange(p.id, e.target.value)}
                style={{ width: 64, padding: '0.3rem 0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', textAlign: 'right' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>%</span>
              {edited[p.id] !== undefined && (
                <button onClick={() => handleSaveFee(p.id)} style={{ marginLeft: 'auto', background: 'var(--color-primary,#0047AB)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Save size={12} /> Save
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '1rem 1.25rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>ℹ️ Integration Notes</h3>
        <ul style={{ fontSize: '0.85rem', color: '#374151', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
          <li>Cash on Delivery has no transaction fee and requires manual confirmation.</li>
          <li>GCash and Maya use PayMongo's e-wallet API for automated payment verification.</li>
          <li>Stripe and PayPal require API keys configured in environment variables.</li>
          <li>Changes take effect immediately for new checkouts. Existing orders are unaffected.</li>
        </ul>
      </div>
    </main>
  )
}
