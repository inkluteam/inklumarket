import { Globe, Bell, Shield, Save, CheckCircle, CreditCard, Mail, ExternalLink, Key, Power, PowerOff } from 'lucide-react'
import { useState } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { getPaymentProviders, setPaymentProviderKeys, togglePaymentProvider, isPaymentProviderConfigured } from '../../services/paymentProviders'
import { isGmailConfigured, getGmailConfigStatus } from '../../services/gmailService'

const PROVIDER_ICONS = {
  paymongo: '🇵🇭',
  stripe: '💳',
  paypal: '🅿️',
  maya: '💜',
  gcash: '📱',
}

const PROVIDER_FIELDS = {
  paymongo: [
    { key: 'publicKey', label: 'Public Key', placeholder: 'pk_test_xxxx', type: 'text' },
    { key: 'secretKey', label: 'Secret Key', placeholder: 'sk_test_xxxx', type: 'password' },
  ],
  stripe: [
    { key: 'publishableKey', label: 'Publishable Key', placeholder: 'pk_test_xxxx', type: 'text' },
    { key: 'secretKey', label: 'Secret Key', placeholder: 'sk_test_xxxx', type: 'password' },
  ],
  paypal: [
    { key: 'clientId', label: 'Client ID', placeholder: 'AYxxxxxxxxxxxxxxx', type: 'text' },
    { key: 'clientSecret', label: 'Client Secret', placeholder: 'EXxxxxxxxxxxxxxxx', type: 'password' },
    { key: 'mode', label: 'Mode', type: 'select', options: [{ value: 'sandbox', label: 'Sandbox (Testing)' }, { value: 'live', label: 'Live (Production)' }] },
  ],
  maya: [
    { key: 'publicKey', label: 'Public Key', placeholder: 'pk-xxxxx', type: 'text' },
    { key: 'secretKey', label: 'Secret Key', placeholder: 'sk-xxxxx', type: 'password' },
    { key: 'merchantId', label: 'Merchant ID', placeholder: 'M-xxxxx', type: 'text' },
  ],
  gcash: [
    { key: 'publicKey', label: 'Public Key', placeholder: 'gcash-pk-xxxxx', type: 'text' },
    { key: 'secretKey', label: 'Secret Key', placeholder: 'gcash-sk-xxxxx', type: 'password' },
    { key: 'merchantId', label: 'Merchant ID', placeholder: 'GC-xxxxx', type: 'text' },
  ],
}

const PROVIDER_DOCS = {
  paymongo: 'https://dashboard.paymongo.com/developers/api-keys',
  stripe: 'https://dashboard.stripe.com/apikeys',
  paypal: 'https://developer.paypal.com/dashboard/applications',
  maya: 'https://developer.maya.ph/',
  gcash: 'https://gcash.com/business',
}

export default function AdminSettings() {
  const { settings, updateSettings, saveSettings } = useSettings()
  const [saved, setSaved] = useState(false)
  const [activeProvider, setActiveProvider] = useState('paymongo')
  const [providers, setProviders] = useState(() => getPaymentProviders())
  const [providerKeys, setProviderKeys] = useState(() => {
    const p = getPaymentProviders()
    const keys = {}
    for (const [id, provider] of Object.entries(p)) {
      keys[id] = { ...provider.keys }
    }
    return keys
  })
  const [providerSaved, setProviderSaved] = useState(false)

  const update = (field, value) => {
    updateSettings(field, value)
    setSaved(false)
  }

  const handleSave = () => {
    saveSettings()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSaveProviderKeys = () => {
    setPaymentProviderKeys(activeProvider, providerKeys[activeProvider])
    setProviderSaved(true)
    setTimeout(() => setProviderSaved(false), 3000)
  }

  const handleToggleProvider = (id) => {
    togglePaymentProvider(id)
    setProviders(getPaymentProviders())
  }

  const gmailStatus = getGmailConfigStatus()
  const currentProvider = providers[activeProvider]

  return (
    <div>
      <h1 className="page-title">Platform Settings</h1>

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-amber-600" /> General Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input type="text" value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <textarea value={settings.siteDescription} onChange={(e) => update('siteDescription', e.target.value)} className="input-field" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (%)</label>
                <input type="number" value={settings.platformFee} onChange={(e) => update('platformFee', e.target.value)} className="input-field" min="0" max="20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={settings.currency} onChange={(e) => update('currency', e.target.value)} className="input-field">
                  <option value="USD">USD ($)</option>
                  <option value="PHP">PHP (₱)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input type="email" value={settings.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input type="tel" value={settings.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-amber-600" /> Payment Providers
          </h2>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {Object.entries(providers).map(([id, provider]) => (
              <button
                key={id}
                onClick={() => setActiveProvider(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeProvider === id ? 'bg-amber-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <span>{PROVIDER_ICONS[id]}</span>
                <span>{provider.name}</span>
                {provider.enabled && isPaymentProviderConfigured(id) && (
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                )}
              </button>
            ))}
          </div>

          {currentProvider && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{PROVIDER_ICONS[activeProvider]}</span>
                  <div>
                    <h3 className="font-bold">{currentProvider.name}</h3>
                    <p className="text-sm text-gray-500">{currentProvider.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${currentProvider.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                    {currentProvider.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleToggleProvider(activeProvider)}
                    className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${currentProvider.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                    aria-label={currentProvider.enabled ? `Disable ${currentProvider.name}` : `Enable ${currentProvider.name}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow ${currentProvider.enabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${isPaymentProviderConfigured(activeProvider) ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <p className={`font-semibold ${isPaymentProviderConfigured(activeProvider) ? 'text-green-800' : 'text-amber-800'}`}>
                  {isPaymentProviderConfigured(activeProvider) ? `✓ ${currentProvider.name} Configured` : `⚠ ${currentProvider.name} Not Configured`}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {isPaymentProviderConfigured(activeProvider)
                    ? `Payment methods from ${currentProvider.name} are available at checkout.`
                    : `Enter your ${currentProvider.name} API keys below to enable payments.`}
                </p>
              </div>

              <div className="space-y-3">
                {PROVIDER_FIELDS[activeProvider].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        value={providerKeys[activeProvider][field.key] || ''}
                        onChange={(e) => setProviderKeys(prev => ({ ...prev, [activeProvider]: { ...prev[activeProvider], [field.key]: e.target.value } }))}
                        className="input-field"
                      >
                        {field.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={providerKeys[activeProvider][field.key] || ''}
                        onChange={(e) => setProviderKeys(prev => ({ ...prev, [activeProvider]: { ...prev[activeProvider], [field.key]: e.target.value } }))}
                        className="input-field font-mono text-sm"
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleSaveProviderKeys} className="btn-outline flex items-center gap-2 text-sm cursor-pointer">
                  <Key className="w-4 h-4" /> Save API Keys
                </button>
                {providerSaved && (
                  <span className="flex items-center gap-2 text-green-600 font-medium text-sm animate-pulse">
                    <CheckCircle className="w-4 h-4" /> Keys saved!
                  </span>
                )}
                {PROVIDER_DOCS[activeProvider] && (
                  <a
                    href={PROVIDER_DOCS[activeProvider]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 ml-auto"
                  >
                    Get API Keys <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="font-semibold text-gray-700 mb-2">Supported Payment Methods</p>
                <div className="grid grid-cols-2 gap-2">
                  {currentProvider.methods.map(method => (
                    <div key={method.id} className="flex items-center gap-2">
                      <span className="text-lg">{method.icon}</span>
                      <div>
                        <span className="font-medium">{method.label}</span>
                        <span className="text-gray-500 text-xs block">{method.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-green-600" /> Email Service — Gmail SMTP
          </h2>
          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-4 rounded-lg ${isGmailConfigured() ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex-1">
                <p className={`font-semibold ${isGmailConfigured() ? 'text-green-800' : 'text-amber-800'}`}>
                  {isGmailConfigured() ? '✓ Gmail Connected' : '⚠ Gmail Not Configured'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {isGmailConfigured()
                    ? 'Order confirmation emails will be sent to both buyers and sellers automatically.'
                    : 'Configure Gmail API to send automatic order confirmation emails.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                <input type="text" value="smtp.gmail.com" disabled className="input-field bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                <input type="text" value="587" disabled className="input-field bg-gray-50" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
              <input type="text" value={gmailStatus.fromEmail || ''} disabled className="input-field bg-gray-50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <div className={`input-field font-mono text-xs ${gmailStatus.clientId ? 'bg-green-50' : 'bg-red-50'}`}>
                  {gmailStatus.clientId ? '✓ Configured' : '✗ Not set'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                <div className={`input-field font-mono text-xs ${gmailStatus.clientSecret ? 'bg-green-50' : 'bg-red-50'}`}>
                  {gmailStatus.clientSecret ? '✓ Configured' : '✗ Not set'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
              <div className={`input-field font-mono text-xs ${gmailStatus.refreshToken ? 'bg-green-50' : 'bg-red-50'}`}>
                {gmailStatus.refreshToken ? '✓ Configured' : '✗ Not set'}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-semibold text-gray-700 mb-2">Email Templates Active</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isGmailConfigured() ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Buyer — Order Confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isGmailConfigured() ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Seller — New Order Notification</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-semibold">How it works:</p>
              <p>When a buyer places an order, the system uses Gmail API with OAuth2 to send branded HTML confirmation emails to both the buyer and the relevant seller.</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-amber-600" /> Notifications
          </h2>
          <div className="space-y-3">
            {[
              { key: 'emailNotifications', label: 'Email notifications for new orders' },
              { key: 'orderNotifications', label: 'Order status change notifications' },
              { key: 'lowStockAlerts', label: 'Low stock alerts for sellers' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <span className="text-sm font-medium">{opt.label}</span>
                <button
                  onClick={() => update(opt.key, !settings[opt.key])}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings[opt.key] ? 'bg-amber-600' : 'bg-gray-300'}`}
                  role="switch"
                  aria-checked={settings[opt.key]}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${settings[opt.key] ? 'translate-x-5' : ''}`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-red-600" /> System
          </h2>
          <div className="space-y-3">
            {[
              { key: 'maintenanceMode', label: 'Maintenance mode (site offline)' },
              { key: 'registrationOpen', label: 'Allow new user registrations' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <span className="text-sm font-medium">{opt.label}</span>
                <button
                  onClick={() => update(opt.key, !settings[opt.key])}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings[opt.key] ? 'bg-amber-600' : 'bg-gray-300'}`}
                  role="switch"
                  aria-checked={settings[opt.key]}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${settings[opt.key] ? 'translate-x-5' : ''}`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2 cursor-pointer">
            <Save className="w-5 h-5" /> Save Settings
          </button>
          {saved && (
            <span className="flex items-center gap-2 text-green-600 font-medium text-sm animate-pulse">
              <CheckCircle className="w-5 h-5" /> Settings saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
