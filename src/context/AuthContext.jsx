import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, signIn, signOut, signUp } from '../lib/supabase'

// Demo accounts still work as fallback when Supabase is unreachable or for offline dev
const demoAccounts = [
  { id: 'u1', name: 'Admin User',  email: 'admin@inclusivemarket.com', password: 'admin123', role: 'admin',  phone: '+63 910 000 0001' },
  { id: 'u3', name: 'Hope Bakery', email: 'hope@bakery.com',           password: 'seller123', role: 'seller', sellerId: 's1', phone: '+63 917 123 4567' },
  { id: 'u2', name: 'Maria Santos',email: 'maria@example.com',         password: 'buyer123', role: 'buyer',  phone: '+63 917 111 2222' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [googleLoading]       = useState(false)

  // ── Bootstrap: restore session from Supabase ────────────────
  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && mounted) {
          await loadProfile(session.user)
        }
      } catch {
        // Supabase unreachable — try localStorage fallback
        const saved = localStorage.getItem('im_current_user')
        if (saved && mounted) setUser(JSON.parse(saved))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    bootstrap()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfile(session.user)
      } else {
        setUser(null)
        localStorage.removeItem('im_current_user')
      }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const loadProfile = async (authUser) => {
    try {
      const { data: profile } = await supabase
        .from('im_profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      const resolved = profile
        ? { ...profile, email: authUser.email }
        : { id: authUser.id, email: authUser.email, name: authUser.email.split('@')[0], role: 'buyer', account_status: 'active' }

      setUser(resolved)
      localStorage.setItem('im_current_user', JSON.stringify(resolved))
    } catch {
      const fallback = { id: authUser.id, email: authUser.email, name: authUser.email.split('@')[0], role: 'buyer' }
      setUser(fallback)
      localStorage.setItem('im_current_user', JSON.stringify(fallback))
    }
  }

  // ── Login ────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    // 1. Try Supabase first
    try {
      const { data, error } = await signIn(email, password)
      if (!error && data?.user) {
        await loadProfile(data.user)
        return { success: true, user: data.user }
      }
    } catch { /* fall through to demo */ }

    // 2. Demo account fallback
    const customUsers = JSON.parse(localStorage.getItem('im_custom_users') || '[]')
    const allUsers = [...demoAccounts, ...customUsers]
    const found = allUsers.find(u => u.email === email && u.password === password)
    if (found) {
      // Ban check: admin may have suspended this account
      const storeUsers = (() => { try { return JSON.parse(localStorage.getItem('im_users')) || [] } catch { return [] } })()
      const record = storeUsers.find(u => u.email === email)
      if (record?.status === 'suspended') {
        return { success: false, error: `This account has been suspended by an administrator.${record.banReason ? ` Reason: ${record.banReason}` : ''}` }
      }
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      localStorage.setItem('im_current_user', JSON.stringify(safeUser))
      return { success: true, user: safeUser }
    }
    return { success: false, error: 'Invalid email or password' }
  }, [])

  // ── Register ─────────────────────────────────────────────────
  const register = useCallback(async (data) => {
    // 1. Try Supabase
    try {
      const { data: authData, error } = await signUp(data.email, data.password, {
        name: data.name,
        role: data.role || 'buyer',
        phone: data.phone,
      })
      if (!error && authData?.user) {
        const newUser = { ...data, id: authData.user.id, account_status: 'active' }
        delete newUser.password
        setUser(newUser)
        localStorage.setItem('im_current_user', JSON.stringify(newUser))
        return { success: true, user: newUser, needsConfirmation: !authData.session }
      }
      if (error) return { success: false, error: error.message }
    } catch { /* fall through */ }

    // 2. localStorage fallback
    const customUsers = JSON.parse(localStorage.getItem('im_custom_users') || '[]')
    if (customUsers.find(u => u.email === data.email) || demoAccounts.find(u => u.email === data.email)) {
      return { success: false, error: 'Email already registered' }
    }
    const newUser = { ...data, id: 'u' + Date.now(), joined: new Date().toISOString().split('T')[0], status: 'active', ordersCount: 0, totalSpent: 0 }
    customUsers.push(newUser)
    localStorage.setItem('im_custom_users', JSON.stringify(customUsers))
    const { password: _, ...safeUser } = newUser
    setUser(safeUser)
    localStorage.setItem('im_current_user', JSON.stringify(safeUser))
    return { success: true, user: safeUser }
  }, [])

  // ── Logout ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await signOut() } catch { /* ignore */ }
    setUser(null)
    localStorage.removeItem('im_current_user')
  }, [])

  // ── Google login (Supabase OAuth) ────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/` },
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message || 'Google login failed' }
    }
  }, [])

  // ── Refresh user data ────────────────────────────────────────
  const refreshUser = useCallback((updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('im_current_user', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle, googleLoading, demoAccounts, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
