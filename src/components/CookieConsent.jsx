import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'

const COOKIE_KEY = 'im_cookie_consent'
const CONSENT_VALUE = { necessary: true, analytics: false, marketing: false, accepted: true, timestamp: null }

export function useCookieConsent() {
  const [consent, setConsent] = useState(() => {
    try {
      const saved = localStorage.getItem(COOKIE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  return { consent, hasConsent: consent?.accepted === true }
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [prefs, setPrefs] = useState({ necessary: true, analytics: false, marketing: false })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_KEY)
      if (!saved) setVisible(true)
    } catch { setVisible(true) }
  }, [])

  const save = (analytics = false, marketing = false) => {
    const consent = { ...CONSENT_VALUE, analytics, marketing, timestamp: Date.now() }
    localStorage.setItem(COOKIE_KEY, JSON.stringify(consent))
    setVisible(false)
  }

  const acceptAll = () => save(true, true)
  const acceptSelected = () => save(prefs.analytics, prefs.marketing)
  const rejectOptional = () => save(false, false)

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
    >
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Cookie className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1">Cookie Preferences</h3>
            <p className="text-sm text-gray-600 mb-3">
              We use cookies to improve your experience on Inclusive Market. In compliance with
              <strong> RA 10173 (Data Privacy Act of 2012)</strong>, we obtain your consent before
              setting non-essential cookies. You can manage your preferences below.
            </p>

            {detailsOpen && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Strictly Necessary</p>
                    <p className="text-xs text-gray-500">Required for the site to function (login, cart, checkout).</p>
                  </div>
                  <span className="text-xs text-gray-400">Always on</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-500">Help us understand how visitors use the site.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs.analytics}
                      onChange={(e) => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Marketing</p>
                    <p className="text-xs text-gray-500">Used to deliver relevant ads and promotions.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs.marketing}
                      onChange={(e) => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={acceptAll} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition">
                Accept All
              </button>
              <button onClick={rejectOptional} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition">
                Reject Optional
              </button>
              {detailsOpen ? (
                <button onClick={acceptSelected} className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition">
                  Save My Choices
                </button>
              ) : (
                <button onClick={() => setDetailsOpen(true)} className="px-4 py-2 text-emerald-600 text-sm font-medium hover:underline">
                  Customize
                </button>
              )}
            </div>
          </div>
          <button onClick={rejectOptional} className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600" aria-label="Dismiss">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
