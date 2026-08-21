import { useState } from 'react'
import { MessageCircle, Send, Search, ChevronLeft, Ban, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'
import { useAuth } from '../../context/AuthContext'
import { containsBannedWords } from '../../utils/moderation'

export default function BuyerMessages() {
  const { user } = useAuth()
  const { conversations, users, sellers, products, getConversationMessages, sendConversationMessage, toggleBlockUser, isBlockedBy } = useDataStore()
  const [selected, setSelected] = useState(null)
  const [body, setBody] = useState('')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  const myConvs = (conversations || []).filter(c => c.buyerId === user?.id)
    .filter(c => {
      const seller = sellers.find(s => s.id === c.sellerId)
      return !search || seller?.name?.toLowerCase().includes(search.toLowerCase())
    })

  const thread = selected ? (getConversationMessages ? getConversationMessages(selected.id) : []) : []
  const sellerOfSelected = selected ? sellers.find(s => s.id === selected.sellerId) : null
  const productOfSelected = selected ? products.find(p => p.id === selected.productId) : null
  // Block state: buyer blocks the seller account tied to this conversation
  const sellerUser = selected ? (users || []).find(u => u.sellerId === selected.sellerId) : null
  const isBlocked = selected && sellerUser ? isBlockedBy(user.id, sellerUser.id) : false

  function handleSend(e) {
    e.preventDefault()
    if (!body.trim() || !selected) return
    if (isBlocked) { setNotice('You blocked this seller. Unblock to continue messaging.'); return }
    const bad = containsBannedWords(body)
    if (bad) {
      setNotice(`Message not sent — flagged word "${bad}" detected. Please keep conversations respectful.`)
      return
    }
    setNotice('')
    sendConversationMessage(selected.id, user.id, body.trim())
    setBody('')
  }

  function handleToggleBlock() {
    if (!selected || !sellerUser) return
    const nowBlocked = toggleBlockUser(user.id, sellerUser.id)
    setNotice(nowBlocked ? `${sellerOfSelected?.name || 'Seller'} blocked — their products are hidden from your catalog.` : 'Seller unblocked.')
  }

  return (
    <main id="main-content" className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageCircle size={22} /> Messages
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '300px 1fr' : '1fr', gap: '1rem', height: '65vh' }}>
        {/* Conversation list */}
        <div style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sellers…" style={{ width: '100%', paddingLeft: '2rem', padding: '0.4rem 0.4rem 0.4rem 2rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: 6, fontSize: '0.875rem' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {myConvs.length === 0 && (
              <p style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>No conversations yet.</p>
            )}
            {myConvs.map(conv => {
              const seller = sellers.find(s => s.id === conv.sellerId)
              const product = products.find(p => p.id === conv.productId)
              const isActive = selected?.id === conv.id
              return (
                <button key={conv.id} onClick={() => setSelected(conv)}
                  style={{ width: '100%', textAlign: 'left', padding: '0.875rem 1rem', borderBottom: '1px solid var(--color-border, #e5e7eb)', background: isActive ? 'var(--color-primary-light, #eff6ff)' : 'transparent', cursor: 'pointer', border: 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{seller?.name || 'Seller'}</div>
                  {product && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Re: {product.name}</div>}
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage || 'No messages yet'}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Thread panel */}
        {selected && (
          <div style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--color-border, #e5e7eb)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><ChevronLeft size={18} /></button>
              <div>
                <div style={{ fontWeight: 600 }}>{sellerOfSelected?.name || 'Seller'}</div>
                {productOfSelected && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>About: {productOfSelected.name}</div>}
              </div>
              {sellerUser && (
                <button onClick={handleToggleBlock} aria-pressed={isBlocked}
                  title={isBlocked ? 'Unblock seller' : 'Block seller'}
                  style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    border: '1px solid ' + (isBlocked ? '#a7f3d0' : '#fecaca'), color: isBlocked ? '#047857' : '#dc2626',
                    background: isBlocked ? '#ecfdf5' : '#fef2f2', borderRadius: 8, padding: '0.3rem 0.6rem' }}>
                  {isBlocked ? <ShieldCheck size={13} /> : <Ban size={13} />} {isBlocked ? 'Unblock' : 'Block'}
                </button>
              )}
            </div>
            {notice && (
              <div role="status" style={{ margin: '0.6rem 1rem 0', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={13} /> {notice}
              </div>
            )}
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {thread.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Start the conversation.</p>}
              {thread.map(msg => {
                const isMe = msg.senderId === user?.id
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
            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border, #e5e7eb)', display: 'flex', gap: '0.5rem' }}>
              <input value={body} onChange={e => setBody(e.target.value)} disabled={isBlocked}
                placeholder={isBlocked ? 'Blocked — unblock to send messages' : 'Type a message…'}
                style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: 8, fontSize: '0.875rem', opacity: isBlocked ? 0.5 : 1 }} />
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
