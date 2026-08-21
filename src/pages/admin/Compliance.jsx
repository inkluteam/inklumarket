import { useState } from 'react'
import { ShieldCheck, FileText, Eye, Search, Download } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'

const TAB_AUDIT = 'audit'
const TAB_CONSENT = 'consent'

export default function AdminCompliance() {
  const { activityLogs, consentLogs, users } = useDataStore()
  const [tab, setTab] = useState(TAB_AUDIT)
  const [search, setSearch] = useState('')

  const filteredAudit = (activityLogs || []).filter(l =>
    !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.user?.toLowerCase().includes(search.toLowerCase()) || l.details?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredConsent = (consentLogs || []).filter(l => {
    const user = users.find(u => u.id === l.userId)
    return !search || l.action?.toLowerCase().includes(search.toLowerCase()) || user?.name?.toLowerCase().includes(search.toLowerCase())
  })

  function exportCSV(rows, filename) {
    const header = Object.keys(rows[0] || {}).join(',')
    const body = rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const TabBtn = ({ value, label, icon: Icon }) => (
    <button onClick={() => setTab(value)}
      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', border: 'none', borderBottom: tab === value ? '3px solid var(--color-primary,#0047AB)' : '3px solid transparent', background: 'transparent', fontWeight: tab === value ? 700 : 400, color: tab === value ? 'var(--color-primary,#0047AB)' : '#6b7280', cursor: 'pointer', fontSize: '0.9rem' }}>
      <Icon size={15} /> {label}
    </button>
  )

  return (
    <main id="main-content" style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldCheck size={22} /> Compliance &amp; Audit
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
        Full audit trail of admin actions and user consent logs for DSWD regulatory compliance.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.25rem' }}>
        <TabBtn value={TAB_AUDIT} label="Audit Log" icon={FileText} />
        <TabBtn value={TAB_CONSENT} label="Consent Log" icon={Eye} />
      </div>

      {/* Search + Export */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tab === TAB_AUDIT ? 'Search actions…' : 'Search by user or action…'} style={{ width: '100%', paddingLeft: '2.25rem', padding: '0.5rem 0.75rem 0.5rem 2.25rem', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem' }} />
        </div>
        <button onClick={() => exportCSV(tab === TAB_AUDIT ? filteredAudit : filteredConsent, `${tab}-log-${Date.now()}.csv`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Audit log table */}
      {tab === TAB_AUDIT && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                {['ID', 'Action', 'User', 'Type', 'Details', 'Time'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', color: '#374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAudit.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No audit entries found.</td></tr>
              )}
              {filteredAudit.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '0.5rem 0.875rem', color: '#9ca3af', fontFamily: 'monospace', fontSize: '0.78rem' }}>{log.id}</td>
                  <td style={{ padding: '0.5rem 0.875rem', fontWeight: 600 }}>{log.action}</td>
                  <td style={{ padding: '0.5rem 0.875rem' }}>{log.user}</td>
                  <td style={{ padding: '0.5rem 0.875rem' }}>
                    <span style={{ background: log.type === 'user' ? '#dbeafe' : log.type === 'product' ? '#d1fae5' : log.type === 'order' ? '#fef3c7' : '#f3f4f6', color: log.type === 'user' ? '#1e40af' : log.type === 'product' ? '#065f46' : log.type === 'order' ? '#92400e' : '#6b7280', borderRadius: 4, padding: '0.15rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {log.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem 0.875rem', color: '#374151', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                  <td style={{ padding: '0.5rem 0.875rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '0.75rem 0.875rem', fontSize: '0.8rem', color: '#9ca3af', borderTop: '1px solid #f3f4f6' }}>{filteredAudit.length} record{filteredAudit.length !== 1 ? 's' : ''}</div>
        </div>
      )}

      {/* Consent log table */}
      {tab === TAB_CONSENT && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                {['ID', 'User', 'Action', 'Purpose', 'Consent', 'Logged At'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', color: '#374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredConsent.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No consent records found.</td></tr>
              )}
              {filteredConsent.map((log, i) => {
                const user = users.find(u => u.id === log.userId)
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '0.5rem 0.875rem', color: '#9ca3af', fontFamily: 'monospace', fontSize: '0.78rem' }}>{log.id}</td>
                    <td style={{ padding: '0.5rem 0.875rem' }}>{user?.name || log.userId}</td>
                    <td style={{ padding: '0.5rem 0.875rem', fontWeight: 600 }}>{log.action}</td>
                    <td style={{ padding: '0.5rem 0.875rem', color: '#374151' }}>{log.purpose}</td>
                    <td style={{ padding: '0.5rem 0.875rem' }}>
                      <span style={{ background: log.consent ? '#d1fae5' : '#fee2e2', color: log.consent ? '#065f46' : '#991b1b', borderRadius: 4, padding: '0.15rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                        {log.consent ? 'ACCEPTED' : 'DECLINED'}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.875rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{log.loggedAt ? new Date(log.loggedAt).toLocaleString('en-PH') : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ padding: '0.75rem 0.875rem', fontSize: '0.8rem', color: '#9ca3af', borderTop: '1px solid #f3f4f6' }}>{filteredConsent.length} record{filteredConsent.length !== 1 ? 's' : ''}</div>
        </div>
      )}
    </main>
  )
}
