import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react'
import AddressBook from '../../components/AddressBook'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { updateUser, addAddress, updateAddress, deleteAddress, setDefaultAddress, getAddressesByUser } = useDataStore()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '123 Main St, Manila, Philippines',
    bio: user?.bio || 'Conscious consumer supporting inclusive businesses.',
  })

  const userAddresses = getAddressesByUser(user?.id || '')

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = () => {
    updateUser(user.id, { name: form.name, phone: form.phone, address: form.address, bio: form.bio })
    refreshUser({ name: form.name, phone: form.phone, address: form.address, bio: form.bio })
    setEditing(false)
    toast.success('Profile updated successfully!')
  }

  const handleSaveAddress = (addr) => {
    if (addr.id && userAddresses.find(a => a.id === addr.id)) {
      updateAddress(user.id, addr.id, addr)
      toast.success('Address updated')
    } else {
      addAddress(user.id, addr)
      toast.success('Address added')
    }
  }

  const handleDeleteAddress = (addrId) => {
    deleteAddress(addrId)
    toast.success('Address removed')
  }

  const handleSetDefault = (addrId) => {
    setDefaultAddress(user.id, addrId)
    toast.success('Default address updated')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="page-title">My Profile</h1>

      <div className="card p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{form.name}</h2>
            <p className="text-gray-600">{user?.role === 'seller' ? 'Seller Account' : user?.role === 'admin' ? 'Admin Account' : 'Buyer Account'}</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${editing ? 'bg-gray-100 text-gray-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
          >
            {editing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} disabled={!editing} className={`input-field pl-10 ${!editing ? 'bg-gray-50' : ''}`} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={form.email} disabled className="input-field pl-10 bg-gray-50" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} disabled={!editing} className={`input-field pl-10 ${!editing ? 'bg-gray-50' : ''}`} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea value={form.address} onChange={(e) => update('address', e.target.value)} disabled={!editing} rows={2} className={`input-field pl-10 ${!editing ? 'bg-gray-50' : ''}`} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} disabled={!editing} rows={3} className={`input-field ${!editing ? 'bg-gray-50' : ''}`} />
          </div>

          {editing && (
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <AddressBook
          addresses={userAddresses}
          onSave={handleSaveAddress}
          onDelete={handleDeleteAddress}
          onSetDefault={handleSetDefault}
        />
      </div>
    </div>
  )
}
