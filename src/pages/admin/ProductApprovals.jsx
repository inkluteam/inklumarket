import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'
import { CheckCircle, XCircle, Package } from 'lucide-react'

export default function ProductApprovals() {
  const { sellers, updateSellerStatus, products, updateProduct } = useDataStore()
  const toast = useToast()
  const pendingSellers = sellers.filter(s => s.status === 'pending')
  const pendingProducts = products.filter(p => p.status === 'pending_review')

  const handleApprove = (seller) => {
    updateSellerStatus(seller.id, 'active')
    toast.success(`${seller.name} has been approved`)
  }

  const handleReject = (seller) => {
    updateSellerStatus(seller.id, 'rejected')
    toast.success(`${seller.name} has been rejected`)
  }

  const handleApproveProduct = (product) => {
    updateProduct(product.id, { status: 'approved' })
    toast.success(`"${product.name}" has been approved`)
  }

  const handleRejectProduct = (product) => {
    updateProduct(product.id, { status: product.previousStatus || 'approved' })
    toast.success(`"${product.name}" has been reverted`)
  }

  return (
    <div>
      <h1 className="page-title">Approvals</h1>

      {pendingProducts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            Product Re-Approvals ({pendingProducts.length})
          </h2>
          <div className="space-y-3">
            {pendingProducts.map(product => (
              <div key={product.id} className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {product.image && <img src={product.image} alt="" className="w-16 h-16 rounded object-cover" />}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <p className="text-xs text-gray-400 mt-1">Seller: {product.sellerName || product.seller}</p>
                      </div>
                      <span className="badge badge-yellow">Pending Review</span>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => handleApproveProduct(product)} className="btn-primary text-sm !py-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Approve Changes
                      </button>
                      <button onClick={() => handleRejectProduct(product)} className="btn-outline text-sm !py-2 flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50">
                        <XCircle className="w-4 h-4" /> Revert
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold mb-4">Seller Approvals ({pendingSellers.length})</h2>

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
