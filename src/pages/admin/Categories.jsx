import { useState } from 'react'
import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

export default function AdminCategories() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useDataStore()
  const toast = useToast()
  const [showAdd, setShowAdd] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '', description: '' })

  const resetForm = () => setForm({ name: '', icon: '', description: '' })

  const handleAdd = () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return }
    addCategory({ name: form.name, icon: form.icon || '📦', description: form.description })
    setShowAdd(false)
    resetForm()
    toast.success('Category added!')
  }

  const handleEdit = () => {
    if (!editCat || !form.name.trim()) return
    updateCategory(editCat.id, { name: form.name, icon: form.icon, description: form.description })
    setEditCat(null)
    resetForm()
    toast.success('Category updated!')
  }

  const handleDelete = (cat) => {
    const count = products.filter(p => p.category === cat.id).length
    if (count > 0) { toast.error(`Cannot delete: ${count} product${count !== 1 ? 's' : ''} in this category`); return }
    if (window.confirm(`Delete "${cat.name}"?`)) {
      deleteCategory(cat.id)
      toast.success('Category deleted')
    }
  }

  const openEdit = (cat) => {
    setEditCat(cat)
    setForm({ name: cat.name, icon: cat.icon, description: cat.description })
  }

  const getProductCount = (catId) => products.filter(p => p.category === catId).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title mb-0">Categories</h1>
        <button onClick={() => { resetForm(); setShowAdd(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="font-bold">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{getProductCount(cat.id)} products</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" aria-label="Edit category"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" aria-label="Delete category"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(showAdd || editCat) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowAdd(false); setEditCat(null) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => { setShowAdd(false); setEditCat(null) }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" placeholder="Category name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input type="text" value={form.icon} onChange={(e) => setForm({...form, icon: e.target.value})} className="input-field" placeholder="📦" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input-field" placeholder="Short description" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowAdd(false); setEditCat(null) }} className="btn-outline flex-1">Cancel</button>
                <button onClick={editCat ? handleEdit : handleAdd} className="btn-primary flex-1">{editCat ? 'Save' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
