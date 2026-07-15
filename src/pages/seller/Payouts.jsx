import { useState } from 'react'
import { useDataStore } from '../../context/DataStore'
import { Download, X } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function SellerPayouts() {
  const { payouts, sellers, addPayout } = useDataStore()
  const { formatMoney } = useSettings()
  const { user } = useAuth()
  const toast = useToast()
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [payoutForm, setPayoutForm] = useState({ amount: '', method: 'bank', accountName: '', accountNumber: '' })

  const seller = sellers.find(s => s.email === user.email)
  const myPayouts = payouts.filter(p => p.sellerId === (seller?.id || 's1'))
  const totalPaid = myPayouts.reduce((s, p) => s + p.amount, 0)

  const availableBalance = 1245
  const pendingClearance = 380

  const handleRequestPayout = () => {
    const amount = parseFloat(payoutForm.amount)
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return }
    if (amount > availableBalance) { toast.error('Amount exceeds available balance'); return }
    if (!payoutForm.accountName.trim()) { toast.error('Account name is required'); return }
    if (!payoutForm.accountNumber.trim()) { toast.error('Account number is required'); return }

    addPayout({
      sellerId: seller?.id || 's1',
      sellerName: seller?.name || user?.name || 'Seller',
      amount,
      method: payoutForm.method === 'bank' ? 'Bank Transfer' : 'GCash',
      accountName: payoutForm.accountName,
    })

    setShowRequestModal(false)
    setPayoutForm({ amount: '', method: 'bank', accountName: '', accountNumber: '' })
    toast.success('Payout request submitted! It will be processed in 3-5 business days.')
  }

  const handleExportCSV = () => {
    if (myPayouts.length === 0) { toast.warning('No payouts to export'); return }
    const headers = ['Payout ID', 'Amount', 'Method', 'Account', 'Date', 'Status']
    const rows = myPayouts.map(p => [p.id, p.amount, p.method, p.accountName, p.date, p.status])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payouts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported successfully!')
  }

  return (
    <div>
      <h1 className="page-title">Payouts</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-3xl font-bold text-emerald-600">{formatMoney(availableBalance)}</p>
          <button onClick={() => setShowRequestModal(true)} className="btn-primary text-sm mt-3 w-full">Request Payout</button>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Pending Clearance</p>
          <p className="text-3xl font-bold text-amber-600">{formatMoney(pendingClearance)}</p>
          <p className="text-xs text-gray-400 mt-2">Available in 3-5 business days</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Total Earned (All Time)</p>
          <p className="text-3xl font-bold">{formatMoney(totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-2">Since joining Inclusive Market</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Payout History</h2>
          <button onClick={handleExportCSV} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Payout ID</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Account</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myPayouts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{p.id}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">{formatMoney(p.amount)}</td>
                  <td className="px-6 py-4">{p.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.accountName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.date}</td>
                  <td className="px-6 py-4"><span className={`badge capitalize ${p.status === 'completed' ? 'badge-green' : p.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>{p.status}</span></td>
                </tr>
              ))}
              {myPayouts.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No payout history yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRequestModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Request Payout</h2>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
              <p className="font-semibold">Available: {formatMoney(availableBalance)}</p>
              <p className="text-xs mt-1">Minimum payout: {formatMoney(100)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="input-field"
                  placeholder="0.00"
                  min="100"
                  max={availableBalance}
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payout Method *</label>
                <select value={payoutForm.method} onChange={(e) => setPayoutForm(prev => ({ ...prev, method: e.target.value }))} className="input-field">
                  <option value="bank">Bank Transfer (BDO/BPI/UnionBank)</option>
                  <option value="gcash">GCash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                <input
                  type="text"
                  value={payoutForm.accountName}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, accountName: e.target.value }))}
                  className="input-field"
                  placeholder="Name on account"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                <input
                  type="text"
                  value={payoutForm.accountNumber}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="input-field"
                  placeholder="Account number"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowRequestModal(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleRequestPayout} className="btn-primary flex-1">Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
