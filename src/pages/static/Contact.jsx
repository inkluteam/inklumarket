import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle, Bot, Headphones } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '../../context/ToastContext'

const AUTO_RESPONSES = {
  general: "Thank you for reaching out to Inclusive Market! Our team has received your message and will respond within 24 hours. Your feedback helps us serve PWD communities better.",
  order: "We understand you have a concern about your order. Our support team is reviewing your message and will get back to you within 12 hours. For urgent order issues, please include your Order ID.",
  refund: "Your refund inquiry has been received. Our team will review your request and respond within 24-48 hours. You can track the status in your Order History.",
  accessibility: "Thank you for your accessibility feedback! We are committed to WCAG 2.1 AA compliance and your input helps us improve. Our accessibility team will review and respond within 24 hours.",
  default: "Thank you for contacting Inclusive Market! We value your feedback and will respond within 24 hours. For immediate assistance, check our FAQ or order messaging system.",
}

function getAutoResponse(subject) {
  const s = subject.toLowerCase()
  if (s.includes('order') || s.includes('delivery') || s.includes('shipping')) return AUTO_RESPONSES.order
  if (s.includes('refund') || s.includes('return') || s.includes('money')) return AUTO_RESPONSES.refund
  if (s.includes('accessibility') || s.includes('screen reader') || s.includes('voice')) return AUTO_RESPONSES.accessibility
  return AUTO_RESPONSES.default
}

export default function Contact() {
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [autoResponse, setAutoResponse] = useState(null)

  const update = (field, value) => { setForm(prev => ({ ...prev, [field]: value })); setErrors(prev => ({ ...prev, [field]: '' })) }

  const handleSubmit = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.message.trim()) e.message = 'Message is required'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    const messages = JSON.parse(localStorage.getItem('im_contact_messages') || '[]')
    messages.push({ ...form, id: Date.now(), date: new Date().toISOString(), read: false })
    localStorage.setItem('im_contact_messages', JSON.stringify(messages))
    setSubmitted(true)
    setAutoResponse(getAutoResponse(form.subject))
    toast.success('Message sent successfully!')
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-amber-600 to-green-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-blue-100">We would love to hear from you. Reach out with questions, feedback, or support requests.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            {[
              { icon: Mail, label: 'Email', value: 'support@inclusivemarket.com' },
              { icon: Phone, label: 'Phone', value: '+63 62 991 2345' },
              { icon: MapPin, label: 'Address', value: 'Manila, Philippines' },
              { icon: Clock, label: 'Hours', value: 'Mon-Fri, 9AM-6PM PHT' },
              { icon: MessageCircle, label: 'Social', value: '@inclusivemarket' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="card p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="relative inline-block mb-4">
                    <Send className="w-12 h-12 text-green-500" />
                    <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                  <p className="text-gray-600 mb-6">We will get back to you within 24 hours.</p>

                  {autoResponse && (
                    <div className="max-w-md mx-auto bg-amber-50 border border-blue-200 rounded-xl p-5 text-left">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-blue-900">Auto-Response</p>
                          <p className="text-xs text-amber-600">Instant feedback</p>
                        </div>
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">{autoResponse}</p>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-200">
                        <Headphones className="w-4 h-4 text-amber-600" />
                        <p className="text-xs text-amber-600">Need immediate help? Call +63 62 991 2345</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" placeholder="Your name" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" placeholder="your@email.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <input type="text" value={form.subject} onChange={(e) => update('subject', e.target.value)} className="input-field" placeholder="How can we help?" />
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                      <textarea value={form.message} onChange={(e) => update('message', e.target.value)} className="input-field" rows={5} placeholder="Your message..." />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                    </div>
                    <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
                      <Send className="w-4 h-4" /> Send Message
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
