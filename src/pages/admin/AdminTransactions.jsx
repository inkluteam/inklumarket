import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'

export default function AdminTransactions() {
  const { transactions } = useDataStore()
  const { formatMoney } = useSettings()
  const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0)
  const totalFees = transactions.reduce((s, t) => s + t.platformFee, 0)
  const totalPayouts = transactions.reduce((s, t) => s + t.sellerPayout, 0)

  return (
    <div>
      <h1 className="page-title">Transactions</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">{formatMoney(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{transactions.length} transactions</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Platform Fees (5%)</p>
          <p className="text-3xl font-bold text-amber-600">{formatMoney(totalFees)}</p>
          <p className="text-xs text-gray-400 mt-1">Revenue from commissions</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Seller Payouts</p>
          <p className="text-3xl font-bold text-amber-600">{formatMoney(totalPayouts)}</p>
          <p className="text-xs text-gray-400 mt-1">Paid to sellers</p>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">TXN ID</th>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Buyer</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Fee</th>
                <th className="px-6 py-3">Payout</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-sm">{t.id}</td>
                  <td className="px-6 py-4 text-sm">{t.orderId}</td>
                  <td className="px-6 py-4 text-sm">{t.buyer}</td>
                  <td className="px-6 py-4 text-sm">{t.seller}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{formatMoney(t.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatMoney(t.platformFee)}</td>
                  <td className="px-6 py-4 text-sm text-amber-600">{formatMoney(t.sellerPayout)}</td>
                  <td className="px-6 py-4 text-sm">{t.method}</td>
                  <td className="px-6 py-4"><span className={`badge ${t.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>{t.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
