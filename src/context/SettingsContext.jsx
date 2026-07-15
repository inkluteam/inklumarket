import { createContext, useContext, useState, useCallback } from 'react'
import { siteSettings } from '../data/mockData'

const SettingsContext = createContext(null)

const CURRENCY_MAP = {
  USD: { symbol: '$', locale: 'en-US', code: 'USD' },
  PHP: { symbol: '₱', locale: 'en-PH', code: 'PHP' },
  EUR: { symbol: '€', locale: 'de-DE', code: 'EUR' },
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('im_admin_settings')
    return saved ? JSON.parse(saved) : siteSettings
  })

  const updateSettings = useCallback((field, value) => {
    setSettings(prev => {
      const next = { ...prev, [field]: value }
      localStorage.setItem('im_admin_settings', JSON.stringify(next))
      return next
    })
  }, [])

  const saveSettings = useCallback(() => {
    localStorage.setItem('im_admin_settings', JSON.stringify(settings))
  }, [settings])

  const formatMoney = useCallback((amount) => {
    const cur = CURRENCY_MAP[settings.currency] || CURRENCY_MAP.PHP
    return `${cur.symbol}${Number(amount).toLocaleString(cur.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }, [settings.currency])

  const currencySymbol = (CURRENCY_MAP[settings.currency] || CURRENCY_MAP.PHP).symbol

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, formatMoney, currencySymbol }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
