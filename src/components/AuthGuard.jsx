import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthGuard({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export function GuestGuard({ children }) {
  const { user } = useAuth()
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />
    return <Navigate to="/" replace />
  }
  return children
}
