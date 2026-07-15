import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Info, X, XCircle } from 'lucide-react'
import { useVoice } from './VoiceContext'

const ToastContext = createContext(null)

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info }
const COLORS = { success: 'bg-green-50 border-green-200 text-green-800', error: 'bg-red-50 border-red-200 text-red-800', warning: 'bg-yellow-50 border-yellow-200 text-yellow-800', info: 'bg-blue-50 border-blue-200 text-blue-800' }
const ICON_COLORS = { success: 'text-green-500', error: 'text-red-500', warning: 'text-yellow-500', info: 'text-blue-500' }

function ToastProviderInner({ children }) {
  const [toasts, setToasts] = useState([])
  const { speak } = useVoice()

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])

    if (type === 'error' || type === 'warning') {
      speak(message, true)
    } else {
      speak(message)
    }

    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
    }
  }, [speak])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-sm" role="status" aria-live="polite" aria-atomic="false">
        {toasts.map(t => {
          const Icon = ICONS[t.type]
          return (
            <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${COLORS[t.type]}`} role="alert">
              <Icon className={`w-5 h-5 shrink-0 ${ICON_COLORS[t.type]}`} aria-hidden="true" />
              <span className="text-sm font-medium flex-1">{t.message}</span>
              <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current rounded" aria-label="Dismiss notification">
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function ToastProvider({ children }) {
  return <ToastProviderInner>{children}</ToastProviderInner>
}

export const useToast = () => useContext(ToastContext)
