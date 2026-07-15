import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const CART_KEY_ANON = 'im_cart'

function cartKey(userId) {
  return userId ? `im_cart_${userId}` : CART_KEY_ANON
}

export function CartProvider({ children }) {
  const { user } = useAuth()

  const load = useCallback((uid) => {
    return JSON.parse(localStorage.getItem(cartKey(uid)) || '[]')
  }, [])

  const [items, setItems] = useState(() => load(user?.id))

  useEffect(() => {
    setItems(load(user?.id))
  }, [user?.id, load])

  const persist = (uid, next) => {
    localStorage.setItem(cartKey(uid), JSON.stringify(next))
  }

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      let next
      if (existing) {
        next = prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      } else {
        next = [...prev, { ...product, quantity }]
      }
      persist(user?.id, next)
      return next
    })
  }

  const removeItem = (id) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      persist(user?.id, next)
      return next
    })
  }

  const updateQuantity = (id, quantity) => {
    setItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, quantity } : i)
      persist(user?.id, next)
      return next
    })
  }

  const clearCart = () => {
    localStorage.removeItem(cartKey(user?.id))
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
