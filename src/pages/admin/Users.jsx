import { useState } from 'react'
import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'
import { Search, Eye, Ban, CheckCircle } from 'lucide-react'

const statusColors = { active: 'badge-green', suspended: 'badge-red', pending: 'badge-yellow' }
const roleColors = { admin: 'badge-blue', seller: 'badge-green', buyer: 'badge-yellow' }

export default function AdminUsers() {
  const { users, updateUserStatus } = useDataStore()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewUser, setViewUser] = useState(null)

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()) || (u.phone && u.phone.includes(searchQuery))
    const matchesRole = !roleFilter || u.role === roleFilter
    const matchesStatus = !statusFilter || u.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleStatusChange = (userId, newStatus) => {
    updateUserStatus(userId, newStatus)
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title mb-0">User Management</h1>
        <span className="text-sm text-gray-500">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="search" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-amber-600 font-semibold">{user.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className={`badge capitalize ${roleColors[user.role]}`}>{user.role}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.joined}</td>
                  <td className="px-6 py-4"><span className={`badge capitalize ${statusColors[user.status]}`}>{user.status}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewUser(user)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" aria-label="View user"><Eye className="w-4 h-4" /></button>
                      {user.status === 'active' && user.role !== 'admin' ? (
                        <button onClick={() => handleStatusChange(user.id, 'suspended')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" aria-label="Suspend user"><Ban className="w-4 h-4" /></button>
                      ) : user.status === 'suspended' ? (
                        <button onClick={() => handleStatusChange(user.id, 'active')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" aria-label="Activate user"><CheckCircle className="w-4 h-4" /></button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewUser(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{viewUser.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{viewUser.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{viewUser.phone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Role</span><span className={`badge capitalize ${roleColors[viewUser.role]}`}>{viewUser.role}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`badge capitalize ${statusColors[viewUser.status]}`}>{viewUser.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Joined</span><span>{viewUser.joined}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
