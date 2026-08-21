import { useState } from 'react'
import { MessageCircle, Send, Search, ChevronLeft } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'
import { useAuth } from '../../context/AuthContext'

export default function SellerMessages() {
  const { user } = useAuth()
  const { conversations, users, sellers, products, getConversationMessages, sendConversationMessage } = useDataStore()
  const [selected, setSelected] = useState(null)
  const [body, setBody] = useState('')
  const [search, setSearch] = useState('')

  // Find the seller profile for this logged-in user
  const mySeller = sellers.find(s => s.email === user?.email)
  const myConvs = (conversations || []).filter(c => c.sellerId === mySeller?.id)
    .filter(c => {
      const buyer = users.find(u => u.id === c.buyerId)
      return !search || buyer?.name?.toLowerCase().includes(search.toLowerCase())
    })

  const thread = selected ? (getConversationMessages ? getConversationMessages(selected.id) : []) : []
  const buyerOfSelected = selected ? users.find(u => u.id === selected.buyerId) : null
  const productOfSelected = selected ? products.find(p => p.id === selected.productId) : null

  function handleSend(e) {
    e.preventDefault()
    if (!body.trim() || !selected || !mySeller) return
    sendConversationMessage(selected.id, mySeller.id, body.trim())
    setBody('')
  }

  return (
    <main id="main-content" style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageCircle size={22} /> Messages
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '300px 1fr' : '1fr', gap: '1rem', height: '65vh' }}>
        {/* Conversation list */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyers…" style={{ width: '100%', paddingLeft: '2rem', padding: '0.4rem 0.4rem 0.4rem 2rem', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.875rem' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {myConvs.length === 0 && (
              <p style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>No buyer messages yet.</p>
            )}
            {myConvs.map(conv => {
              const buyer = users.find(u => u.id === conv.buyerId)
              const product = products.find(p => p.id === conv.productId)
              const isActive = selected?.id === conv.id
              return (
                <button key={conv.id} onClick={() => setSelected(conv)}
                  style={{ width: '100%', textAlign: 'left', padding: '0.875rem 1rem', borderBottom: '1px solid #e5e7eb', background: isActive ? '#eff6ff' : 'transparent', cursor: 'pointer', border: 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{buyer?.name || 'Buyer'}</div>
                  {product && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Re: {product.name}</div>}
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage || 'No messages yet'}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Thread panel */}
        {selected && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><ChevronLeft size={18} /></button>
              <div>
                <div style={{ fontWeight: 600 }}>{buyerOfSelected?.name || 'Buyer'}</div>
                {productOfSelected && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>About: {productOfSelected.name}</div>}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {thread.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>No messages yet.</p>}
              {thread.map(msg => {
                const isMe = msg.senderId === mySeller?.id
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', padding: '0.5rem 0.875rem', borderRadius: 12, background: isMe ? 'var(--color-primary, #0047AB)' : '#f3f4f6', color: isMe ? '#fff' : '#111', fontSize: '0.875rem' }}>
                      {msg.body}
                      <div style={{ fontSize: '0.65rem', opacity: 0.65, marginTop: 2 }}>{msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <form onSubmit={handleSend} style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.5rem' }}>
              <input value={body} onChange={e => setBody(e.target.value)} placeholder="Type a message…" style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem' }} />
              <button type="submit" style={{ background: 'var(--color-primary, #0047AB)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Send size={14} /> Send
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
