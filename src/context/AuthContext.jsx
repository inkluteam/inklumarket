import { createContext, useContext, useState, useCallback } from 'react'
import { triggerGoogleLogin, clearGoogleToken } from '../services/googleAuth'

const demoAccounts = [
  { id: 'u1', name: 'Admin User', email: 'admin@inclusivemarket.com', password: 'admin123', role: 'admin', phone: '+63 910 000 0001' },
  { id: 'u3', name: 'Hope Bakery', email: 'hope@bakery.com', password: 'seller123', role: 'seller', sellerId: 's1', phone: '+63 917 123 4567' },
  { id: 'u2', name: 'Maria Santos', email: 'maria@example.com', password: 'buyer123', role: 'buyer', phone: '+63 917 111 2222' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('im_current_user')
    return saved ? JSON.parse(saved) : null
  })
  const [googleLoading, setGoogleLoading] = useState(false)

  const login = (email, password) => {
    const customUsers = JSON.parse(localStorage.getItem('im_custom_users') || '[]')
    const allUsers = [...demoAccounts, ...customUsers]

    const found = allUsers.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      localStorage.setItem('im_current_user', JSON.stringify(safeUser))
      return { success: true, user: safeUser }
    }
    return { success: false, error: 'Invalid email or password' }
  }

  const loginWithGoogle = useCallback(async () => {
    setGoogleLoading(true)
    try {
      const googleUser = await triggerGoogleLogin()

      const customUsers = JSON.parse(localStorage.getItem('im_custom_users') || '[]')
      const allUsers = [...demoAccounts, ...customUsers]
      let existingUser = allUsers.find(u => u.email === googleUser.email)

      if (existingUser) {
        const safeUser = { ...existingUser, picture: googleUser.picture, provider: 'google' }
        delete safeUser.password
        setUser(safeUser)
        localStorage.setItem('im_current_user', JSON.stringify(safeUser))
        return { success: true, user: safeUser, isNew: false }
      }

      const newUser = {
        id: 'u' + Date.now(),
        name: googleUser.name,
        email: googleUser.email,
        phone: '',
        role: 'buyer',
        joined: new Date().toISOString().split('T')[0],
        status: 'active',
        ordersCount: 0,
        totalSpent: 0,
        avatar: googleUser.picture,
        provider: 'google',
      }

      customUsers.push(newUser)
      localStorage.setItem('im_custom_users', JSON.stringify(customUsers))
      setUser(newUser)
      localStorage.setItem('im_current_user', JSON.stringify(newUser))
      return { success: true, user: newUser, isNew: true }
    } catch (err) {
      return { success: false, error: err.message || 'Google login failed' }
    } finally {
      setGoogleLoading(false)
    }
  }, [])

  const register = (data) => {
    const customUsers = JSON.parse(localStorage.getItem('im_custom_users') || '[]')
    if (customUsers.find(u => u.email === data.email) || demoAccounts.find(u => u.email === data.email)) {
      return { success: false, error: 'Email already registered' }
    }
    const newUser = {
      ...data,
      id: 'u' + Date.now(),
      joined: new Date().toISOString().split('T')[0],
      status: 'active',
      ordersCount: 0,
      totalSpent: 0,
    }
    customUsers.push(newUser)
    localStorage.setItem('im_custom_users', JSON.stringify(customUsers))
    const { password: _, ...safeUser } = newUser
    setUser(safeUser)
    localStorage.setItem('im_current_user', JSON.stringify(safeUser))
    return { success: true, user: safeUser }
  }

  const logout = () => {
    localStorage.removeItem('im_current_user')
    clearGoogleToken()
    setUser(null)
  }

  const refreshUser = (updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('im_current_user', JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginWithGoogle, googleLoading, demoAccounts, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
