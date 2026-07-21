import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { useDataStore } from '../../context/DataStore'
import { useToast } from '../../context/ToastContext'
import { CreditCard, Truck, CheckCircle, AlertCircle, Send, Loader2, MapPin, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { createGCashSource, createCardSource } from '../../services/paymongoService'
import { createStripeCheckoutSession } from '../../services/stripeService'
import { createPayPalOrder } from '../../services/paypalService'
import { createMayaPayment } from '../../services/mayaService'
import { createGcashPayment } from '../../services/gcashService'
import { getEnabledPaymentMethods } from '../../services/paymentProviders'
import { sendOrderConfirmationEmail, isGmailConfigured } from '../../services/gmailService'

const STATIC_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵', requiresApi: false },
  { id: 'bank', label: 'Bank Transfer', desc: 'Direct bank deposit (BDO, BPI, UnionBank)', icon: '🏦', requiresApi: false },
]

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const { formatMoney } = useSettings()
  const { addOrder, sellers, getAddressesByUser, addAddress } = useDataStore()
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: user?.name || '', address: '', city: '', phone: user?.phone || '', paymentMethod: 'cod',
  })
  const [errors, setErrors] = useState({})
  const [orderPlaced, setOrderPlaced] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null)
  const [cardForm, setCardForm] = useState({ number: '', expMonth: '', expYear: '', cvc: '', name: '' })
  const [showAddresses, setShowAddresses] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [saveNewAddress, setSaveNewAddress] = useState(false)
  const [addressLabel, setAddressLabel] = useState('')

  const savedAddresses = useMemo(() => user?.id ? getAddressesByUser(user.id) : [], [user, getAddressesByUser])

  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr = savedAddresses.find(a => a.isDefault)
      if (defaultAddr) {
        selectAddress(defaultAddr)
      }
    }
  }, [savedAddresses])

  const selectAddress = (addr) => {
    setSelectedAddressId(addr.id)
    setForm(prev => ({
      ...prev,
      name: addr.label || prev.name,
      address: [addr.street, addr.barangay].filter(Boolean).join(', '),
      city: [addr.city, addr.province, addr.zip].filter(Boolean).join(', '),
      phone: addr.phone || prev.phone,
    }))
    setShowAddresses(false)
  }

  const enabledMethods = useMemo(() => getEnabledPaymentMethods(), [])
  const allMethods = useMemo(() => {
    const dynamic = enabledMethods.map(m => ({ ...m, requiresApi: true }))
    return [...STATIC_METHODS, ...dynamic]
  }, [enabledMethods])

  const hasOnlinePayment = enabledMethods.length > 0

  const update = (field, value) => { setForm(prev => ({ ...prev, [field]: value })); setErrors(prev => ({ ...prev, [field]: '' })) }
  const updateCard = (field, value) => setCardForm(prev => ({ ...prev, [field]: value }))

  const selectedMethod = allMethods.find(m => m.id === form.paymentMethod)
  const requiresCardInput = selectedMethod?.requiresApi && (form.paymentMethod.includes('card') || form.paymentMethod.includes('stripe-card') || form.paymentMethod.includes('paypal-card'))
  const requiresRedirect = selectedMethod?.requiresApi && !requiresCardInput

  const getCardType = (number) => {
    const num = number.replace(/\s/g, '')
    if (/^4/.test(num)) return { type: 'Visa', color: 'bg-blue-600', textColor: 'text-white' }
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return { type: 'Mastercard', color: 'bg-orange-500', textColor: 'text-white' }
    if (/^3[47]/.test(num)) return { type: 'Amex', color: 'bg-blue-400', textColor: 'text-white' }
    if (/^6(?:011|5)/.test(num)) return { type: 'Discover', color: 'bg-orange-600', textColor: 'text-white' }
    return null
  }

  const cardType = getCardType(cardForm.number)
  const maskedCardNumber = cardForm.number ? cardForm.number.replace(/\d(?=.{4})/g, '•') : '•••• •••• •••• ••••'

  useEffect(() => {
    if (requiresCardInput && !cardForm.name && user?.name) {
      setCardForm(prev => ({ ...prev, name: user.name }))
    }
  }, [requiresCardInput, user])

  const validateStep1 = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateCard = () => {
    if (!requiresCardInput) return true
    const e = {}
    if (!cardForm.number.trim() || cardForm.number.replace(/\s/g, '').length < 16) e.cardNumber = 'Valid card number is required'
    if (!cardForm.expMonth.trim() || !cardForm.expYear.trim()) e.cardExpiry = 'Expiry date is required'
    if (!cardForm.cvc.trim() || cardForm.cvc.length < 3) e.cardCvc = 'Valid CVC is required'
    if (!cardForm.name.trim()) e.cardName = 'Cardholder name is required'
    setErrors(prev => ({ ...prev, ...e }))
    return Object.keys(e).length === 0
  }

  const processPayment = async (orderId) => {
    if (!selectedMethod?.requiresApi) {
      return { success: true, paymentStatus: 'pending' }
    }

    setProcessing(true)
    try {
      const email = user?.email || ''
      const name = form.name
      const description = `Inclusive Market Order #${orderId}`

      if (form.paymentMethod === 'paymongo-gcash') {
        const result = await createGCashSource({ amount: total, email, name, orderId, description })
        if (result.success && result.source?.attributes?.redirect?.checkout_url) {
          window.location.href = result.source.attributes.redirect.checkout_url
          return { success: true, paymentStatus: 'processing' }
        }
        return { success: false, error: result.error }
      }

      if (form.paymentMethod === 'paymongo-card') {
        const cardNumber = cardForm.number.replace(/\s/g, '')
        const result = await createCardSource({ amount: total, email, name, orderId, cardNumber, expMonth: cardForm.expMonth, expYear: cardForm.expYear, cvc: cardForm.cvc })
        if (result.success && result.source?.attributes?.redirect?.checkout_url) {
          window.location.href = result.source.attributes.redirect.checkout_url
          return { success: true, paymentStatus: 'processing' }
        }
        return { success: false, error: result.error }
      }

      if (form.paymentMethod.startsWith('stripe-')) {
        const result = await createStripeCheckoutSession({
          amount: total, currency: 'php', email, name, orderId,
          items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
        })
        if (result.success && result.url) {
          window.location.href = result.url
          return { success: true, paymentStatus: 'processing' }
        }
        return { success: false, error: result.error }
      }

      if (form.paymentMethod.startsWith('paypal-')) {
        const result = await createPayPalOrder({
          amount: total, currency: 'USD', email, name, orderId,
          items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
        })
        if (result.success && result.approveUrl) {
          window.location.href = result.approveUrl
          return { success: true, paymentStatus: 'processing' }
        }
        return { success: false, error: result.error }
      }

      if (form.paymentMethod.startsWith('maya-')) {
        const result = await createMayaPayment({ amount: total, email, name, orderId, description })
        if (result.success && result.redirectUrl) {
          window.location.href = result.redirectUrl
          return { success: true, paymentStatus: 'processing' }
        }
        return { success: false, error: result.error }
      }

      if (form.paymentMethod.startsWith('gcash-')) {
        const result = await createGcashPayment({ amount: total, email, name, orderId, description })
        if (result.success && result.redirectUrl) {
          window.location.href = result.redirectUrl
          return { success: true, paymentStatus: 'processing' }
        }
        return { success: false, error: result.error }
      }

      return { success: true, paymentStatus: 'pending' }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setProcessing(false)
    }
  }

  const sendEmails = async (order) => {
    if (!isGmailConfigured()) {
      setEmailStatus({ sent: false, reason: 'not_configured' })
      return
    }

    setEmailStatus({ sending: true })
    try {
      const buyerEmail = user?.email
      const orderItems = order.items.map(item => ({ name: item.name, qty: item.qty, price: item.price }))

      const sellerProduct = items[0]
      const seller = sellers.find(s => s.id === sellerProduct?.sellerId)
      const sellerEmail = seller?.email || 'seller@inclusivemarket.com'
      const sellerName = seller?.name || 'Seller'

      const orderForEmail = {
        id: order.id,
        items: orderItems,
        total: order.total,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
      }

      const result = await sendOrderConfirmationEmail(
        orderForEmail,
        buyerEmail,
        sellerEmail,
        user?.name || 'Customer',
        sellerName
      )

      setEmailStatus({ sent: true, buyerEmail: result.buyerEmail, sellerEmail: result.sellerEmail })
      if (result.buyerEmail) toast.success('Confirmation email sent to your inbox!')
      if (result.sellerEmail) toast.success('Seller has been notified of your order!')
      if (!result.buyerEmail && !result.sellerEmail) toast.warning('Order placed but email notifications failed to send.')
    } catch (err) {
      setEmailStatus({ sent: false, error: err.message })
    }
  }

  const handlePlaceOrder = async () => {
    setProcessing(true)
    try {
      const orderItems = items.map(item => ({ productId: item.id, name: item.name, qty: item.quantity, price: item.price, image: item.image, sellerId: item.sellerId }))
      const newOrder = addOrder({
        buyer: user?.name || 'Guest',
        buyerId: user?.id,
        buyerEmail: user?.email,
        items: orderItems,
        total,
        status: 'pending',
        paymentMethod: form.paymentMethod,
        shippingAddress: `${form.address}, ${form.city}`,
        shippingPhone: form.phone,
      })

      if (selectedMethod?.requiresApi) {
        const paymentResult = await processPayment(newOrder.id)
        if (!paymentResult.success) {
          toast.error(paymentResult.error || 'Payment processing failed')
          setProcessing(false)
          return
        }
        newOrder.paymentStatus = paymentResult.paymentStatus
      }

      setOrderPlaced(newOrder)
      clearCart()
      toast.success('Order placed successfully!')

      await sendEmails(newOrder)
    } catch (err) {
      toast.error('Failed to place order: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
        <Link to="/catalog" className="text-amber-600 hover:text-amber-700">Browse Catalog</Link>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-2">Order #{orderPlaced.id}</p>
        <p className="text-gray-600 mb-6">Thank you for supporting inclusive businesses.</p>

        {emailStatus && (
          <div className={`mx-auto max-w-md mb-6 p-4 rounded-lg text-sm ${emailStatus.sent ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-2 font-semibold">
              <Send className="w-4 h-4" />
              Email Notifications
            </div>
            {emailStatus.sent ? (
              <div className="text-left space-y-1">
                <p className={emailStatus.buyerEmail ? 'text-green-700' : 'text-amber-700'}>
                  {emailStatus.buyerEmail ? '✓ Confirmation sent to ' + user?.email : '✗ Failed to send to buyer'}
                </p>
                <p className={emailStatus.sellerEmail ? 'text-green-700' : 'text-amber-700'}>
                  {emailStatus.sellerEmail ? '✓ Seller notified' : '✗ Failed to notify seller'}
                </p>
              </div>
            ) : (
              <p className="text-amber-700">
                {emailStatus.reason === 'not_configured' ? 'Gmail not configured. Enable in Admin Settings.' : 'Email sending failed. Check console for details.'}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Link to="/buyer/orders" className="btn-primary">View My Orders</Link>
          <Link to="/catalog" className="btn-outline">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="page-title">Checkout</h1>

      <div className="flex items-center justify-center mb-8">
        {[{ n: 1, label: 'Shipping', icon: Truck }, { n: 2, label: 'Payment', icon: CreditCard }, { n: 3, label: 'Confirm', icon: CheckCircle }].map(({ n, label, icon: Icon }) => (
          <div key={n} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === n ? 'bg-amber-600 text-white' : step > n ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <Icon className="w-4 h-4" />
              <span className="text-sm font-semibold hidden sm:inline">{label}</span>
            </div>
            {n < 3 && <div className={`w-12 h-0.5 ${step > n ? 'bg-green-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Truck className="w-5 h-5" /> Shipping Information</h2>

              {savedAddresses.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowAddresses(!showAddresses)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      Use a saved address ({savedAddresses.length} available)
                    </span>
                    {showAddresses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showAddresses && (
                    <div className="p-3 space-y-2 border-t">
                      {savedAddresses.map(addr => (
                        <button
                          key={addr.id}
                          onClick={() => selectAddress(addr)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${selectedAddressId === addr.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{addr.label || 'Address'}</span>
                            {addr.isDefault && <span className="text-xs bg-green-100 text-emerald-700 px-2 py-0.5 rounded-full">Default</span>}
                          </div>
                          <p className="text-gray-600">{addr.street}</p>
                          <p className="text-gray-500 text-xs">{[addr.barangay, addr.city, addr.province, addr.zip].filter(Boolean).join(', ')}</p>
                          {addr.phone && <p className="text-gray-500 text-xs">Phone: {addr.phone}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="relative flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or enter manually</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" placeholder="Recipient name" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea value={form.address} onChange={(e) => update('address', e.target.value)} className="input-field" rows={2} placeholder="Street address" />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="input-field" placeholder="City" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" placeholder="+63 9XX XXX XXXX" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              {user && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Save className="w-4 h-4 text-green-600" />
                    Save this address for faster checkout next time
                  </label>
                  {saveNewAddress && (
                    <input
                      type="text"
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Label (e.g. Home, Office)"
                    />
                  )}
                </div>
              )}

              <button onClick={() => {
                if (validateStep1()) {
                  if (saveNewAddress && user && form.address && form.city) {
                    addAddress(user.id, {
                      label: addressLabel || 'Shipping Address',
                      street: form.address,
                      barangay: '',
                      city: form.city.split(',')[0]?.trim() || form.city,
                      province: 'Zamboanga del Sur',
                      zip: '7000',
                      phone: form.phone,
                      isDefault: savedAddresses.length === 0,
                    })
                    toast.success('Address saved for future checkouts!')
                  }
                  setStep(2)
                }
              }} className="btn-primary w-full mt-4">Continue to Payment</button>
            </div>
          )}

          {step === 2 && (
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment Method</h2>

              {!hasOnlinePayment && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Online payments not configured</p>
                    <p>Enable and configure payment providers in Admin Settings. Cash on Delivery and Bank Transfer are always available.</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {allMethods.map(method => {
                  const disabled = method.requiresApi && !method._enabled
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${disabled ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : `cursor-pointer ${form.paymentMethod === method.id ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={form.paymentMethod === method.id}
                        disabled={disabled}
                        onChange={(e) => update('paymentMethod', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-xl">{method.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{method.label}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                      {method.requiresApi && (
                        <span className={`text-xs px-2 py-1 rounded-full ${!disabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                          {disabled ? 'API Required' : 'Available'}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>

              {requiresCardInput && (
                <div className="border-t pt-4 mt-4 space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700">Card Payment Details</h3>

                  <div className={`rounded-xl p-4 ${cardType ? cardType.color : 'bg-gradient-to-br from-gray-600 to-gray-800'} ${cardType ? cardType.textColor : 'text-white'} shadow-lg`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-7 bg-yellow-400/80 rounded" />
                      {cardType && (
                        <span className="text-xs font-bold uppercase tracking-wider opacity-90">{cardType.type}</span>
                      )}
                    </div>
                    <p className="font-mono text-lg tracking-widest mb-3">{maskedCardNumber}</p>
                    <div className="flex justify-between text-xs opacity-80">
                      <div>
                        <p className="uppercase text-[10px] opacity-60">Card Holder</p>
                        <p className="font-medium">{cardForm.name || 'YOUR NAME'}</p>
                      </div>
                      <div className="text-right">
                        <p className="uppercase text-[10px] opacity-60">Expires</p>
                        <p className="font-medium">{cardForm.expMonth && cardForm.expYear ? `${cardForm.expMonth}/${cardForm.expYear}` : 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardForm.number}
                        onChange={(e) => updateCard('number', e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                        className="input-field pr-12"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                      />
                      {cardType && (
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded ${cardType.color} ${cardType.textColor}`}>
                          {cardType.type}
                        </span>
                      )}
                    </div>
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Exp Month</label>
                      <input
                        type="text"
                        value={cardForm.expMonth}
                        onChange={(e) => updateCard('expMonth', e.target.value.replace(/\D/g, '').slice(0, 2))}
                        className="input-field"
                        placeholder="MM"
                        maxLength={2}
                      />
                      {errors.cardExpiry && <p className="text-red-500 text-xs mt-1">{errors.cardExpiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Exp Year</label>
                      <input
                        type="text"
                        value={cardForm.expYear}
                        onChange={(e) => updateCard('expYear', e.target.value.replace(/\D/g, '').slice(0, 2))}
                        className="input-field"
                        placeholder="YY"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input
                        type="text"
                        value={cardForm.cvc}
                        onChange={(e) => updateCard('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="input-field"
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cardCvc && <p className="text-red-500 text-xs mt-1">{errors.cardCvc}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardForm.name}
                      onChange={(e) => updateCard('name', e.target.value)}
                      className="input-field"
                      placeholder="Name on card"
                    />
                    {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                  </div>
                </div>
              )}

              {requiresRedirect && selectedMethod && (
                <div className="border-t pt-4 mt-4 space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700">{selectedMethod.label} Payment</h3>
                  <div className="bg-amber-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-1">{selectedMethod.icon} {selectedMethod.label} Redirect</p>
                    <p>You will be redirected to {selectedMethod.label} to complete your payment securely.</p>
                  </div>
                </div>
              )}

              {form.paymentMethod === 'bank' && (
                <div className="border-t pt-4 mt-4 space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700">Bank Transfer Instructions</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                    <p><strong>BDO:</strong> Inclusive Market Inc. — 0012-3456-7890</p>
                    <p><strong>BPI:</strong> Inclusive Market Inc. — 1234-5678-9012</p>
                    <p><strong>UnionBank:</strong> Inclusive Market Inc. — 9012-3456-7890</p>
                    <p className="text-gray-500 mt-2">Upload proof of payment to your seller or email it to payments@inclusivemarket.com</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                <button
                  onClick={() => {
                    if (requiresCardInput) {
                      if (validateCard()) setStep(3)
                    } else {
                      setStep(3)
                    }
                  }}
                  className="btn-primary flex-1"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatMoney(item.price)}</p>
                    </div>
                    <span className="font-semibold">{formatMoney(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <div className="flex justify-between text-sm mb-1"><span>Shipping</span><span className="text-green-600">Free</span></div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Payment</span>
                  <span>{selectedMethod?.label || form.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm"><span>Delivery</span><span>{form.address}, {form.city}</span></div>
              </div>

              {selectedMethod?.requiresApi && (
                <div className="bg-amber-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-semibold">
                    {selectedMethod.icon} You will be redirected to {selectedMethod.label} to complete payment
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(2)} disabled={processing} className="btn-outline flex-1">Back</button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {selectedMethod?.requiresApi ? 'Processing Payment...' : 'Placing Order...'}
                    </>
                  ) : (
                    selectedMethod?.requiresApi ? 'Pay & Place Order' : 'Place Order'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 h-fit">
          <h3 className="font-bold mb-4">Order Total</h3>
          <div className="space-y-2 text-sm">
            {items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                <span className="shrink-0">{formatMoney(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-green-600">{formatMoney(total)}</span>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              {isGmailConfigured()
                ? '📧 Confirmation emails will be sent after order'
                : '📧 Email notifications not configured'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
