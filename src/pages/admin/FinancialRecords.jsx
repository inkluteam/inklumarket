import { useMemo, useState } from 'react'
import { Download, CheckCircle2, XCircle, TrendingUp, Wallet, RotateCcw, Clock } from 'lucide-react'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'

const METHOD_LABEL = { gcash: 'GCash', maya: 'Maya', cod: 'Cash on Delivery', bank: 'Bank Transfer' }

function statusOf(o) {
  if (o.status === 'delivered' || o.status === 'completed') return 'completed'
  if (o.status === 'refunded') return 'refunded'
  if (o.status === 'cancelled') return 'rejected'
  return o.status === 'pending' ? 'pending' : 'approved'
}
const STATUS_STYLE = {
  completed: { bg: '#ECFDF5', fg: '#047857' },
  approved: { bg: '#EFF6FF', fg: '#1D4ED8' },
  pending: { bg: '#FFFBEB', fg: '#B45309' },
  refunded: { bg: '#FDF2F8', fg: '#BE185D' },
  rejected: { bg: '#F3F4F6', fg: '#4B5563' }
}

export default function FinancialRecords() {
  const { orders, updateOrderStatus } = useDataStore()
  const { formatMoney, currencySymbol } = useSettings()
  const [period, setPeriod] = useState('all')

  const ledger = useMemo(() => {
    const rows = orders.map((o, i) => ({
      no: 'FIN-' + String(1000 + orders.length - i),
      order: o,
      type: o.status === 'refunded' ? 'Refund' : 'Sale',
      method: METHOD_LABEL[(o.paymentMethod || '').toLowerCase()] || (o.paymentMethod || '—'),
      amount: Math.abs(Number(o.total) || 0),
      status: statusOf(o),
      when: (o.createdAt || o.date || '')
    }))
    const now = new Date()
    const cutoff = period === 'today' ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : period === 'week' ? new Date(now.getTime() - 7 * 864e5)
      : period === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1)
      : period === 'year' ? new Date(now.getFullYear(), 0, 1)
      : null
    const filtered = cutoff ? rows.filter(r => new Date(r.when) >= cutoff) : rows
    return filtered.sort((a, b) => String(b.when).localeCompare(String(a.when)))
  }, [orders, period])

  const sum = f => ledger.filter(f).reduce((s, r) => s + r.amount, 0)
  const gross = sum(() => true)
  const refunds = sum(r => r.type === 'Refund')
  const codCollected = sum(r => /cash on delivery/i.test(r.method) && r.status !== 'pending')
  const pendingValue = sum(r => r.status === 'pending')
  const net = gross - refunds

  const thisMonth = new Date().toISOString().slice(0, 7)
  const lastMonthDate = new Date(); lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
  const lastMonth = lastMonthDate.toISOString().slice(0, 7)
  const mSum = ym => orders.filter(o => String(o.date).startsWith(ym)).reduce((s, o) => s + (Number(o.total) || 0), 0)
  const tm = mSum(thisMonth), lm = mSum(lastMonth)
  const deltaPct = lm > 0 ? ((tm - lm) / lm) * 100 : (tm > 0 ? 100 : 0)

  function decide(no, ok) {
    const row = ledger.find(r => r.no === no)
    if (row && row.order.status === 'pending') updateOrderStatus(row.order.id, ok ? 'processing' : 'cancelled')
  }

  function exportCSV() {
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [
      ['Record No#', 'Date & Time', 'Type', 'Method', 'Amount', 'Status', 'Order'].join(','),
      ...ledger.map(r => [r.no, r.when, r.type, r.method, r.amount.toFixed(2), r.status, r.order.id].map(esc).join(','))
    ]
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `financial-records-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const cards = [
    { label: `Gross Sales (${period})`, value: formatMoney(gross), icon: TrendingUp, color: '#059669', delta: deltaPct },
    { label: 'Net Revenue', value: formatMoney(net), icon: Wallet, color: '#2563eb' },
    { label: 'Refunds', value: formatMoney(refunds), icon: RotateCcw, color: '#be185d' },
    { label: 'COD Collected', value: formatMoney(codCollected), icon: Clock, color: '#b45309' }
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h1 className="page-title mb-0">Financial Records</h1>
        <div className="flex flex-wrap items-center gap-2">
          {[['today', 'Today'], ['week', 'Week'], ['month', 'Month'], ['year', 'Year'], ['all', 'All']].map(([k, l]) => (
            <button key={k} onClick={() => setPeriod(k)} className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: period === k ? '#0047AB' : '#f3f4f6', color: period === k ? '#fff' : '#374151' }}>{l}</button>
          ))}
          <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-1.5 ml-1"><Download className="w-4 h-4" /> CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between mb-1.5">
              <c.icon className="w-5 h-5" style={{ color: c.color }} />
              {typeof c.delta === 'number' && (
                <span className={`text-xs font-bold ${c.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {c.delta >= 0 ? '+' : ''}{c.delta.toFixed(0)}% vs last month
                </span>
              )}
            </div>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Financial records ledger">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4 whitespace-nowrap">Record No#</th>
              <th className="py-3 px-4 whitespace-nowrap">Date &amp; Time</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ledger.length === 0 && <tr><td colSpan="7" className="text-center py-10 text-gray-400">No records for this period.</td></tr>}
            {ledger.map(r => {
              const s = STATUS_STYLE[r.status]
              const isPending = r.order.status === 'pending'
              return (
                <tr key={r.no} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">{r.no}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{r.when}</td>
                  <td className="py-3 px-4 font-medium">{r.type}</td>
                  <td className="py-3 px-4">{r.method}</td>
                  <td className="py-3 px-4 text-right font-semibold whitespace-nowrap" style={{ color: r.type === 'Refund' ? '#be185d' : '#047857' }}>{currencySymbol}{r.amount.toFixed(2)}</td>
                  <td className="py-3 px-4"><span className="text-[.7rem] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: s.bg, color: s.fg }}>{r.status}</span></td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {isPending ? (
                      <span className="inline-flex gap-1.5">
                        <button onClick={() => decide(r.no, true)} aria-label={`Approve ${r.no}`} className="p-1.5 rounded-lg hover:bg-green-50" style={{ color: '#059669' }}><CheckCircle2 className="w-4.5 h-4.5" size={18} /></button>
                        <button onClick={() => decide(r.no, false)} aria-label={`Reject ${r.no}`} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: '#dc2626' }}><XCircle className="w-4.5 h-4.5" size={18} /></button>
                      </span>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">Pending entries can be approved or rejected — decisions are written to the Audit Log with the Total Amount.</p>
    </div>
  )
}
