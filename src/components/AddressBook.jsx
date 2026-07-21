import { useState } from 'react'
import { MapPin, Plus, Edit3, Trash2, Star, Check } from 'lucide-react'

export default function AddressBook({ addresses = [], onSave, onDelete, onSetDefault }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ label: '', street: '', barangay: '', city: '', province: 'Zamboanga del Sur', zip: '7000', phone: '', isDefault: false })

  const startNew = () => {
    setEditing('new')
    setForm({ label: '', street: '', barangay: '', city: '', province: 'Zamboanga del Sur', zip: '7000', phone: '', isDefault: false })
  }

  const startEdit = (addr) => {
    setEditing(addr.id)
    setForm({ ...addr })
  }

  const save = () => {
    if (!form.street || !form.city) return
    onSave(form)
    setEditing(null)
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Saved Addresses
        </h3>
        <button onClick={startNew} className="btn-primary text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {editing === 'new' && (
        <div className="card p-4 border-2 border-green-300">
          <h4 className="font-semibold mb-3">New Address</h4>
          <AddressForm form={form} setForm={setForm} inputClass={inputClass} />
          <div className="flex gap-2 mt-3">
            <button onClick={save} className="btn-primary text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Save</button>
            <button onClick={() => setEditing(null)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {addresses.length === 0 && editing !== 'new' && (
        <p className="text-sm text-gray-500 py-4 text-center">No saved addresses yet. Add one for faster checkout.</p>
      )}

      {addresses.map(addr => (
        <div key={addr.id} className={`card p-4 ${addr.isDefault ? 'border-2 border-green-300' : ''}`}>
          {editing === addr.id ? (
            <>
              <AddressForm form={form} setForm={setForm} inputClass={inputClass} />
              <div className="flex gap-2 mt-3">
                <button onClick={save} className="btn-primary text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Update</button>
                <button onClick={() => setEditing(null)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{addr.label || 'Address'}</span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{addr.street}</p>
                <p className="text-sm text-gray-600">{addr.barangay && `${addr.barangay}, `}{addr.city}, {addr.province} {addr.zip}</p>
                {addr.phone && <p className="text-sm text-gray-500 mt-1">Phone: {addr.phone}</p>}
              </div>
              <div className="flex items-center gap-1">
                {!addr.isDefault && (
                  <button onClick={() => onSetDefault(addr.id)} className="p-1.5 text-gray-400 hover:text-green-600 rounded" title="Set as default">
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => startEdit(addr)} className="p-1.5 text-gray-400 hover:text-amber-600 rounded" title="Edit">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(addr.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AddressForm({ form, setForm, inputClass }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Label (e.g. Home, Office)"
        value={form.label}
        onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="Phone number"
        value={form.phone}
        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="Street address *"
        value={form.street}
        onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))}
        className={`${inputClass} sm:col-span-2`}
        required
      />
      <input
        type="text"
        placeholder="Barangay"
        value={form.barangay}
        onChange={(e) => setForm(f => ({ ...f, barangay: e.target.value }))}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="City/Municipality *"
        value={form.city}
        onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
        className={inputClass}
        required
      />
      <input
        type="text"
        placeholder="Province"
        value={form.province}
        onChange={(e) => setForm(f => ({ ...f, province: e.target.value }))}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="ZIP Code"
        value={form.zip}
        onChange={(e) => setForm(f => ({ ...f, zip: e.target.value }))}
        className={inputClass}
      />
      <label className="flex items-center gap-2 sm:col-span-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm(f => ({ ...f, isDefault: e.target.checked }))}
          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        Set as default address
      </label>
    </div>
  )
}
