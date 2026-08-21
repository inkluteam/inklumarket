import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDataStore } from '../context/DataStore'

const TYPE_STYLE = {
  ticket: { bg: '#EEF2FF', fg: '#4338CA', label: 'Support' },
  order: { bg: '#ECFDF5', fg: '#047857', label: 'Order' },
  product: { bg: '#FFF7ED', fg: '#C2410C', label: 'Product' },
  system: { bg: '#F3F4F6', fg: '#374151', label: 'System' }
}

export default function Notifications() {
  const { user } = useAuth()
  const { getNotificationsForUser, markNotificationRead, markAllNotificationsRead } = useDataStore()
  const list = getNotificationsForUser ? getNotificationsForUser(user?.id) : []
  const unread = list.filter(n => !n.isRead).length

  return (
    <main id="main-content" className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem', maxWidth: 820 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Bell size={22} /> Notifications
          {unread > 0 && <span className="badge badge-blue">{unread} new</span>}
        </h1>
        {unread > 0 && (
          <button onClick={() => markAllNotificationsRead(user.id)} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', background: 'none', border: 'none', color: '#E6397E', fontWeight: 600, cursor: 'pointer', fontSize: '.9rem' }}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
          <Bell size={36} style={{ margin: '0 auto .75rem', opacity: .5 }} />
          <p style={{ fontWeight: 600, color: '#374151' }}>No notifications yet</p>
          <p style={{ fontSize: '.9rem', marginTop: '.25rem' }}>Updates about your orders and support tickets will appear here.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '.6rem' }}>
          {list.map(n => {
            const s = TYPE_STYLE[n.type] || TYPE_STYLE.system
            return (
              <li key={n.id} style={{ background: n.isRead ? '#fff' : '#FFFBEB', border: `1px solid ${n.isRead ? '#e5e7eb' : '#fcd34d'}`, borderRadius: 12, padding: '.9rem 1.1rem', display: 'flex', gap: '.8rem', alignItems: 'flex-start' }}>
                <span style={{ background: s.bg, color: s.fg, fontSize: '.72rem', fontWeight: 700, padding: '.15rem .55rem', borderRadius: 999, whiteSpace: 'nowrap', marginTop: 2 }}>{s.label}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '.92rem', color: '#111827', fontWeight: n.isRead ? 400 : 600 }}>{n.message}</p>
                  <p style={{ fontSize: '.78rem', color: '#9ca3af', marginTop: '.2rem' }}>{new Date(n.createdAt).toLocaleString()}</p>
                  {n.link && (
                    <Link to={n.link} onClick={() => !n.isRead && markNotificationRead(n.id)} style={{ fontSize: '.82rem', color: '#E6397E', fontWeight: 600, textDecoration: 'none' }}>View →</Link>
                  )}
                </div>
                {!n.isRead && (
                  <button onClick={() => markNotificationRead(n.id)} aria-label="Mark as read" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', padding: '.2rem .5rem', fontSize: '.75rem', color: '#6b7280' }}>Read</button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
