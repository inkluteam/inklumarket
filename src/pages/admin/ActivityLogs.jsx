import { useMemo, useState } from 'react'
import { Clock, Download, Search, Receipt } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'

const typeColors = { user: 'badge-blue', product: 'badge-green', order: 'badge-yellow', system: 'badge-red', ticket: 'badge-blue' }

export default function ActivityLogs() {
  const { activityLogs } = useDataStore()
  const { currencySymbol } = useSettings()
  const [typeFilter, setTypeFilter] = useState('all')
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const rows = useMemo(() => activityLogs.filter(l => {
    if (typeFilter !== 'all' && l.type !== typeFilter) return false
    if (from && (l.ts || '') < from) return false
    if (to && (l.ts || '').slice(0, 10) > to) return false
    if (q) {
      const hay = `${l.action} ${l.user} ${l.details} ${l.refNo || ''}`.toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  }), [activityLogs, typeFilter, q, from, to])

  function exportCSV() {
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [
      ['Ref No#', 'Date & Time', 'Actor', 'Action', 'Entity', 'Amount', 'Details'].join(','),
      ...rows.map(l => [l.refNo || l.id, l.ts ? new Date(l.ts).toLocaleString('en-PH') : l.time, l.user, l.action, l.type, l.amount ?? '', l.details].map(esc).join(','))
    ]
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h1 className="page-title mb-0">Audit Log</h1>
        <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-1.5"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      <div className="card p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search action, actor, ref…"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm" aria-label="Search audit log" />
        </label>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm capitalize" aria-label="Filter by entity type">
          <option value="all">All entities</option>
          <option value="order">Orders</option>
          <option value="product">Products</option>
          <option value="user">Users</option>
          <option value="system">System</option>
        </select>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" aria-label="From date" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" aria-label="To date" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Audit log entries">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4 whitespace-nowrap">Ref No#</th>
              <th className="py-3 px-4 whitespace-nowrap">Date &amp; Time</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 && (
              <tr><td colSpan="7" className="text-center py-10 text-gray-400">No matching entries.</td></tr>
            )}
            {rows.map(l => {
              const amt = typeof l.amount === 'number' && l.amount !== 0
              return (
                <tr key={l.id} className="hover:bg-gray-50 align-top">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">{l.refNo || l.id}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap"><span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{l.ts ? new Date(l.ts).toLocaleString('en-PH') : l.time}</span></td>
                  <td className="py-3 px-4 font-medium">{l.user}</td>
                  <td className="py-3 px-4">{l.action}</td>
                  <td className="py-3 px-4"><span className={`badge capitalize ${typeColors[l.type] || 'badge-red'}`}>{l.type}</span></td>
                  <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${amt ? (l.amount < 0 ? 'text-red-600' : 'text-green-700') : 'text-gray-300'}`}>
                    {amt ? <span className="inline-flex items-center gap-1"><Receipt className="w-3.5 h-3.5" />{currencySymbol}{Math.abs(l.amount).toFixed(2)}</span> : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{l.details}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">{rows.length} of {activityLogs.length} entries · financial actions carry the transaction Total Amount.</p>
    </div>
  )
}
