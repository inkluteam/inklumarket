import { useState, useCallback, createContext, useContext, useEffect } from 'react'

const VisualAlertContext = createContext(null)

function readVisualAlertsEnabled() {
  return localStorage.getItem('im_visual_alerts') === 'true'
}

export function VisualAlertProvider({ children }) {
  const [alerts, setAlerts] = useState([])
  const [enabled, setEnabled] = useState(readVisualAlertsEnabled)

  useEffect(() => {
    const check = () => setEnabled(readVisualAlertsEnabled())
    window.addEventListener('storage', check)
    const interval = setInterval(check, 500)
    return () => {
      window.removeEventListener('storage', check)
      clearInterval(interval)
    }
  }, [])

  const triggerAlert = useCallback((message, type = 'info') => {
    if (!enabled) return
    const id = Date.now() + Math.random()
    setAlerts(prev => [...prev, { id, message, type }])
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 2500)
  }, [enabled])

  const value = { triggerAlert, enabled }

  return (
    <VisualAlertContext.Provider value={value}>
      {children}
      {enabled && (
        <div className="fixed inset-0 pointer-events-none z-[200]" aria-hidden="true">
          {alerts.map(alert => (
            <VisualFlash key={alert.id} type={alert.type} message={alert.message} />
          ))}
        </div>
      )}
    </VisualAlertContext.Provider>
  )
}

export const useVisualAlert = () => useContext(VisualAlertContext)

function VisualFlash({ type, message }) {
  const colorMap = {
    success: 'from-green-500 to-green-600',
    error: 'from-red-500 to-rose-500',
    warning: 'from-yellow-500 to-amber-500',
    info: 'from-blue-500 to-indigo-500',
  }

  const iconMap = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center animate-visual-flash">
      <div className={`bg-gradient-to-br ${colorMap[type]} text-white px-12 py-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4`}>
        <span className="text-6xl font-bold">{iconMap[type]}</span>
        <span className="text-xl font-semibold text-center max-w-md">{message}</span>
      </div>
    </div>
  )
}

export function FlashOnAction({ action, message, type = 'success', children }) {
  const { triggerAlert } = useVisualAlert() || {}

  const handleClick = (e) => {
    if (action) action(e)
    if (triggerAlert) triggerAlert(message, type)
  }

  return (
    <span onClick={handleClick} className="contents">
      {children}
    </span>
  )
}
