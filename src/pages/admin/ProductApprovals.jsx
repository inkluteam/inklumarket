import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'
import { CheckCircle, XCircle } from 'lucide-react'

export default function ProductApprovals() {
  const { sellers, updateSellerStatus } = useDataStore()
  const toast = useToast()
  const pendingSellers = sellers.filter(s => s.status === 'pending')

  const handleApprove = (seller) => {
    updateSellerStatus(seller.id, 'active')
    toast.success(`${seller.name} has been approved`)
  }

  const handleReject = (seller) => {
    updateSellerStatus(seller.id, 'rejected')
    toast.success(`${seller.name} has been rejected`)
  }

  return (
    <div>
      <h1 className="page-title">Seller Approvals</h1>

      {pendingSellers.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">All Caught Up!</h2>
          <p className="text-gray-500">No pending seller applications to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingSellers.map(seller => (
            <div key={seller.id} className="card p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-2xl">🏪</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{seller.name}</h3>
                      <p className="text-gray-600 mt-1 text-sm">{seller.bio}</p>
                    </div>
                    <span className="badge badge-yellow">Pending Review</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="text-sm text-gray-500">{seller.email}</span>
                    <span className="text-sm text-gray-500">{seller.phone}</span>
                    <span className="badge badge-blue text-xs">{seller.disabilityType} disability</span>
                    <span className="text-sm text-gray-500">{seller.location}</span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => handleApprove(seller)} className="btn-primary text-sm !py-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleReject(seller)} className="btn-outline text-sm !py-2 flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
