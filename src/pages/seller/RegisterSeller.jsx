import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, CheckCircle, Upload } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'

export default function RegisterSeller() {
  const { user, refreshUser } = useAuth()
  const { addSeller } = useDataStore()
  const toast = useToast()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    businessName: '', businessType: 'individual', description: '', address: '',
    disabilityType: '', pwdId: '', pwdFile: null, products: '', website: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }
    const allowed = ['image/png', 'image/jpeg', 'application/pdf']
    if (!allowed.includes(file.type)) { toast.error('Only PNG, JPG, or PDF allowed'); return }
    setForm(prev => ({ ...prev, pwdFile: file }))
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">Your seller account is now active. You can start adding products right away.</p>
          <div className="flex justify-center gap-3">
            <Link to="/seller/dashboard" className="btn-primary">Go to Seller Dashboard</Link>
            <Link to="/" className="btn-outline">Back to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  const handleFinalSubmit = () => {
    if (!form.businessName.trim()) { toast.error('Business name is required'); return }
    if (!form.description.trim()) { toast.error('Business description is required'); return }
    if (!form.address.trim()) { toast.error('Business address is required'); return }

    const newSeller = addSeller({
      name: form.businessName,
      email: user?.email || '',
      phone: user?.phone || '',
      bio: form.description,
      disabilityType: form.disabilityType || 'Not specified',
      location: form.address,
      businessType: form.businessType,
    })

    refreshUser({ role: 'seller', sellerId: newSeller.id })
    setSubmitted(true)
    toast.success('Seller account created! Welcome to Inclusive Market.')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <Store className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h1 className="text-3xl font-bold">Become a Seller</h1>
        <p className="text-gray-600 mt-2">Join Inclusive Market and reach conscious consumers</p>
      </div>

      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && <div className={`w-16 h-0.5 ${step > s ? 'bg-green-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-8">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Business Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input type="text" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} className="input-field" placeholder="Your business name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
              <div className="grid grid-cols-3 gap-3">
                {['individual', 'cooperative', 'organization'].map(type => (
                  <button key={type} type="button" onClick={() => update('businessType', type)}
                    className={`p-3 rounded-lg border-2 text-center text-sm capitalize transition-all ${form.businessType === type ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Description *</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="input-field" rows={3} placeholder="Tell us about your business..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Address *</label>
              <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} className="input-field" placeholder="Full address" />
            </div>
            <button onClick={() => setStep(2)} className="btn-primary w-full">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">PWD Verification</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              This information helps us verify PWD-led enterprises and provide appropriate support.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PWD Identification Type *</label>
              <input type="text" value={form.disabilityType} onChange={(e) => update('disabilityType', e.target.value)} className="input-field" placeholder="e.g., Physical, Visual, Hearing, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PWD ID Number *</label>
              <input type="text" value={form.pwdId} onChange={(e) => update('pwdId', e.target.value)} className="input-field" placeholder="PWD ID Number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload PWD ID *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              >
                {form.pwdFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-700">{form.pwdFile.name}</p>
                      <p className="text-xs text-gray-400">{(form.pwdFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Product & Store Setup</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What products will you sell? *</label>
              <textarea value={form.products} onChange={(e) => update('products', e.target.value)} className="input-field" rows={3} placeholder="Describe the products you plan to sell..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website / Social Media (optional)</label>
              <input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} className="input-field" placeholder="https://..." />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Seller Agreement</h3>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 rounded border-gray-300" required />
                <span className="text-sm text-gray-600">
                  I agree to the <Link to="/static/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and{' '}
                  <Link to="/static/accessibility" className="text-blue-600 hover:underline">Accessibility Standards</Link>.
                </span>
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline flex-1">Back</button>
              <button onClick={handleFinalSubmit} className="btn-primary flex-1">Submit Application</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
