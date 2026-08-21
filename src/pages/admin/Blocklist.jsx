import { useState } from 'react'
import { Ban, ShieldCheck, Search, Users } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'

export default function AdminBlocklist() {
  const { blocklist = [], users = [], toggleBlockUser } = useDataStore()
  const toast = useToast()
  const [q, setQ] = useState('')

  const rows = blocklist.map(b => ({
    ...b,
    blocker: users.find(u => u.id === b.userId),
    blocked: users.find(u => u.id === b.blockedId)
  })).filter(r => {
    if (!q) return true
    const hay = `${r.blocker?.name || r.userId} ${r.blocked?.name || r.blockedId}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  function unblock(row) {
    toggleBlockUser(row.userId, row.blockedId)
    toast.success(`Unblocked ${row.blocked?.name || row.blockedId}`)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="page-title mb-0 flex items-center gap-2"><Ban size={22} /> Blocklist</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search names…" aria-label="Search blocklist"
            className="input-field pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Blocks', value: blocklist.length, icon: Ban, color: '#dc2626' },
          { label: 'Registered Users', value: users.length, icon: Users, color: '#2563eb' },
          { label: 'Blocked Sellers', value: new Set(blocklist.map(b => b.blockedId)).size, icon: ShieldCheck, color: '#b45309' }
        ].map(c => (
          <div key={c.label} className="card p-5">
            <c.icon className="w-5 h-5 mb-1.5" style={{ color: c.color }} />
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="User blocklist entries">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Blocked By (Buyer)</th>
              <th className="py-3 px-4">Blocked Account</th>
              <th className="py-3 px-4 whitespace-nowrap">Since</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 && (
              <tr><td colSpan="4" className="text-center py-10 text-gray-400">
                {blocklist.length === 0 ? 'No blocks yet — buyers can block sellers from their Messages page.' : 'No matching entries.'}
              </td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.userId + '-' + r.blockedId} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{r.blocker?.name || <span className="text-gray-400 font-mono text-xs">{r.userId}</span>}</td>
                <td className="py-3 px-4">
                  {r.blocked?.name || <span className="text-gray-400 font-mono text-xs">{r.blockedId}</span>}
                  {r.blocked?.role && <span className="badge capitalize ml-2 badge-blue">{r.blocked.role}</span>}
                </td>
                <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleString('en-PH') : '—'}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => unblock(r)} className="btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1.5" style={{ color: '#047857', borderColor: '#a7f3d0' }}>
                    <ShieldCheck size={13} /> Unblock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">Blocks are user-created; admins may lift any block. Every change is recorded in the Audit Log.</p>
    </div>
  )
}
