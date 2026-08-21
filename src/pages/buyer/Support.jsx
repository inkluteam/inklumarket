import { useState } from 'react'
import { LifeBuoy, Plus, X, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'
import { useAuth } from '../../context/AuthContext'

const STATUS_COLOR = { open: '#f59e0b', in_progress: '#3b82f6', resolved: '#10b981' }
const STATUS_ICON = { open: Clock, in_progress: AlertCircle, resolved: CheckCircle }
const PRIORITY_COLOR = { low: '#6b7280', normal: '#3b82f6', high: '#ef4444' }

export default function BuyerSupport() {
  const { user } = useAuth()
  const { supportTickets, createTicket, getTicketsByUser } = useDataStore()
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ subject: '', description: '', priority: 'normal' })

  const myTickets = getTicketsByUser ? getTicketsByUser(user?.id) : (supportTickets || []).filter(t => t.userId === user?.id)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.subject.trim() || !form.description.trim()) return
    createTicket({ ...form, userId: user?.id, userName: user?.name || user?.email })
    setForm({ subject: '', description: '', priority: 'normal' })
    setShowForm(false)
  }

  return (
    <main id="main-content" className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LifeBuoy size={22} /> Support Tickets
        </h1>
        <button onClick={() => setShowForm(true)} style={{ background: 'var(--color-primary, #0047AB)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* New ticket modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.75rem', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Open a New Ticket</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Subject</label>
                <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of your issue" style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' }}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</label>
                <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your issue in detail…" rows={4} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1.2rem', background: 'var(--color-primary, #0047AB)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket list */}
      {myTickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <LifeBuoy size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <p>No support tickets yet. Open one if you need help.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myTickets.map(ticket => {
            const Icon = STATUS_ICON[ticket.status] || Clock
            return (
              <div key={ticket.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem 1.25rem', cursor: 'pointer', background: selected?.id === ticket.id ? '#eff6ff' : '#fff' }} onClick={() => setSelected(selected?.id === ticket.id ? null : ticket)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{ticket.subject}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{ticket.id} · {new Date(ticket.createdAt).toLocaleDateString('en-PH')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: PRIORITY_COLOR[ticket.priority] || '#6b7280', background: '#f3f4f6', borderRadius: 4, padding: '0.15rem 0.5rem' }}>{ticket.priority}</span>
                    <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3, color: STATUS_COLOR[ticket.status] || '#6b7280' }}>
                      <Icon size={13} /> {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {selected?.id === ticket.id && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem' }}>{ticket.description}</p>
                    {(ticket.responses || []).length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>RESPONSES</div>
                        {ticket.responses.map(r => (
                          <div key={r.id} style={{ background: '#f9fafb', borderRadius: 6, padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{r.authorName} · <span style={{ fontWeight: 400, color: '#9ca3af' }}>{new Date(r.sentAt).toLocaleString('en-PH')}</span></div>
                            <div style={{ marginTop: 2 }}>{r.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {(ticket.responses || []).length === 0 && <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Awaiting response from support team.</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
