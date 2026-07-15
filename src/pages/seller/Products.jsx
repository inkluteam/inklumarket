import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStore'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../context/ToastContext'
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react'

export default function SellerProducts() {
  const { user } = useAuth()
  const { products, categories, addProduct, updateProduct, deleteProduct } = useDataStore()
  const { formatMoney } = useSettings()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', category: '1', stock: '', description: '', accessibility: '' })

  const sellerId = user?.sellerId
  const myProducts = products.filter(p => p.sellerId === sellerId)
  const filtered = myProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const resetForm = () => setForm({ name: '', price: '', category: '1', stock: '', description: '', accessibility: '' })

  const handleAdd = () => {
    if (!form.name.trim() || !form.price) { toast.error('Please fill in product name and price'); return }
    addProduct({
      name: form.name, price: parseFloat(form.price), category: form.category,
      stock: parseInt(form.stock) || 0, description: form.description,
      accessibility: form.accessibility || 'Accessible product',
      seller: user?.name || 'Seller', sellerId, image: '/images/product.jpg', featured: false,
    })
    setShowAddModal(false)
    resetForm()
    toast.success('Product added successfully!')
  }

  const handleEdit = () => {
    if (!editProduct) return
    const substantiveChanged = form.name !== editProduct.name || parseFloat(form.price) !== editProduct.price || form.description !== (editProduct.description || '') || form.category !== editProduct.category
    updateProduct(editProduct.id, {
      name: form.name, price: parseFloat(form.price), category: form.category,
      stock: parseInt(form.stock) || 0, description: form.description,
      accessibility: form.accessibility || editProduct.accessibility,
      status: substantiveChanged ? 'pending_review' : editProduct.status,
      previousStatus: substantiveChanged ? editProduct.status : undefined,
    })
    setEditProduct(null)
    resetForm()
    toast.success(substantiveChanged ? 'Product updated and resubmitted for admin review' : 'Product updated successfully!')
  }

  const handleDelete = (product) => {
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      deleteProduct(product.id)
      toast.success('Product deleted')
    }
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setForm({ name: product.name, price: String(product.price), category: product.category, stock: String(product.stock), description: product.description, accessibility: product.accessibility || '' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title mb-0">My Products</h1>
        <button onClick={() => { resetForm(); setShowAddModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">Added {product.dateAdded}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="badge badge-blue">{categories.find(c => c.id === product.category)?.name}</span></td>
                  <td className="px-6 py-4 font-semibold">{formatMoney(product.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${product.stock > 10 ? 'badge-green' : product.stock > 0 ? 'badge-yellow' : 'badge-red'}`}>{product.stock}</span>
                  </td>
                  <td className="px-6 py-4">{product.rating} ({product.reviews})</td>
                  <td className="px-6 py-4"><span className="badge badge-green capitalize">{product.status}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" aria-label="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(showAddModal || editProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowAddModal(false); setEditProduct(null) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => { setShowAddModal(false); setEditProduct(null) }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" placeholder="Product name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="input-field" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} className="input-field" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input-field">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input-field" rows={3} placeholder="Product description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility Info</label>
                <input type="text" value={form.accessibility} onChange={(e) => setForm({...form, accessibility: e.target.value})} className="input-field" placeholder="e.g. Braille labels, easy-grip" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowAddModal(false); setEditProduct(null) }} className="btn-outline flex-1">Cancel</button>
                <button onClick={editProduct ? handleEdit : handleAdd} className="btn-primary flex-1">{editProduct ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
