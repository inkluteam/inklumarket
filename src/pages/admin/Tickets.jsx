import { useState } from 'react'
import { LifeBuoy, MessageSquare, Send, Clock } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'
import { useAuth } from '../../context/AuthContext'

const STATUS_COLOR = { open: '#f59e0b', in_progress: '#3b82f6', resolved: '#10b981' }
const PRIORITY_COLOR = { low: '#6b7280', normal: '#3b82f6', high: '#ef4444' }

export default function AdminTickets() {
  const { user } = useAuth()
  const { supportTickets = [], updateTicketStatus, addTicketResponse } = useDataStore()
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [reply, setReply] = useState('')

  const filtered = filter === 'all' ? supportTickets : supportTickets.filter(t => t.status === filter)
  const counts = {
    all: supportTickets.length,
    open: supportTickets.filter(t => t.status === 'open').length,
    in_progress: supportTickets.filter(t => t.status === 'in_progress').length,
    resolved: supportTickets.filter(t => t.status === 'resolved').length
  }
  const selected = supportTickets.find(t => t.id === selectedId)

  function sendReply() {
    if (!reply.trim() || !selected) return
    addTicketResponse(selected.id, user.id, user.name || 'Admin Support', reply.trim())
    if (selected.status === 'open') updateTicketStatus(selected.id, 'in_progress')
    setReply('')
  }

  return (
    <div className="space-y-5" style={{ padding: '1.25rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><LifeBuoy size={22} /> Support Tickets</h1>
        <div className="flex gap-1.5">
          {[['all', 'All'], ['open', 'Open'], ['in_progress', 'In Progress'], ['resolved', 'Resolved']].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{ background: filter === k ? '#0047AB' : '#f3f4f6', color: filter === k ? '#fff' : '#374151' }}>
              {label} ({counts[k]})
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? 'minmax(300px,380px) 1fr' : '1fr', gap: '1rem', alignItems: 'start' }}>
        <div className="card divide-y divide-gray-100" role="list" aria-label="Support tickets">
          {filtered.length === 0 && <p className="p-8 text-center text-sm text-gray-400">No tickets in this view.</p>}
          {filtered.map(t => (
            <button key={t.id} role="listitem" onClick={() => setSelectedId(t.id)}
              className="w-full text-left p-3.5 hover:bg-rose-50/50 transition-colors"
              style={{ background: selectedId === t.id ? '#FFF1F6' : undefined }}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-gray-800">{t.id}</span>
                <span className="text-[.7rem] font-bold px-2 py-0.5 rounded-full" style={{ background: STATUS_COLOR[t.status] + '22', color: STATUS_COLOR[t.status] }}>{t.status.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-gray-700 mt-0.5 truncate">{t.subject}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.userName || t.userId} · {(t.responses || []).length} replies</p>
            </button>
          ))}
        </div>

        {selected && (
          <section className="card p-5 space-y-4" aria-label={`Ticket ${selected.id}`}>
            <div>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h2 className="font-bold text-gray-900">{selected.subject}</h2>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  Status:
                  <select value={selected.status} onChange={e => updateTicketStatus(selected.id, e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold"
                    style={{ color: STATUS_COLOR[selected.status] }}
                    aria-label="Update ticket status">
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="resolved">resolved</option>
                  </select>
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock size={11} /> Opened {new Date(selected.createdAt).toLocaleString()} by {selected.userName || selected.userId}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 text-sm text-gray-700 whitespace-pre-wrap">{selected.description}</div>

            {(selected.responses || []).length > 0 && (
              <ul className="space-y-2.5" aria-label="Replies">
                {selected.responses.map(r => {
                  const isAdmin = r.authorId !== selected.userId
                  return (
                    <li key={r.id} style={{ marginLeft: isAdmin ? '2rem' : 0, marginRight: isAdmin ? 0 : '2rem' }}>
                      <div className="rounded-xl p-3 text-sm" style={{ background: isAdmin ? '#EEF2FF' : '#F9FAFB', border: '1px solid ' + (isAdmin ? '#e0e7ff' : '#e5e7eb') }}>
                        <p className="text-xs font-bold mb-1" style={{ color: isAdmin ? '#4338CA' : '#374151' }}>{r.authorName}{isAdmin ? ' · Support' : ''}</p>
                        <p className="whitespace-pre-wrap">{r.message}</p>
                        <p className="text-[.68rem] text-gray-400 mt-1">{new Date(r.sentAt).toLocaleString()}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {selected.status !== 'resolved' && (
              <div className="flex gap-2 items-start">
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2} placeholder="Write a reply… (Ctrl+Enter to send)"
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply() }}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" aria-label="Reply message" />
                <button onClick={sendReply} disabled={!reply.trim()}
                  className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center gap-1.5 disabled:opacity-40"
                  style={{ background: '#0047AB' }}><Send size={15} /> Reply</button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
