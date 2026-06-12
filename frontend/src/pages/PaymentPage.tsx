import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/Layout'
import api from '../services/api'
import { LocalOrder, LocalPayment, LocalPaymentSettings } from '../types/localApi'
import { clearCart, getCart } from '../utils/cart'
import { getBillBreakdown } from '../utils/billing'
import { getLocalSession } from '../utils/session'

export function PaymentPage() {
  const navigate = useNavigate()
  const session = getLocalSession()
  const [method, setMethod] = useState('')
  const [paymentSettings, setPaymentSettings] = useState<LocalPaymentSettings | null>(null)
  const [utrNumber, setUtrNumber] = useState('')
  const [screenshotName, setScreenshotName] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState(session?.default_delivery_location || 'Hostel A Block 201')
  const [deliverySlot, setDeliverySlot] = useState('Evening')
  const [studentPhone, setStudentPhone] = useState(session?.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cart = getCart()
  const bill = getBillBreakdown(cart)
  const manualReady = Boolean(paymentSettings?.manual_enabled && paymentSettings.upi_id)

  useEffect(() => {
    api.get<LocalPaymentSettings>('/local/payment-settings')
      .then(response => {
        setPaymentSettings(response.data)
        if (response.data.manual_enabled && response.data.upi_id) {
          setMethod('Manual UTR')
        }
      })
      .catch(() => setError('Unable to load payment settings.'))
  }, [])

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!cart.length) {
      setError('Cart is empty.')
      return
    }
    if (!manualReady || method !== 'Manual UTR') {
      setError('Payment is not configured by admin yet.')
      return
    }
    if (!utrNumber.trim() || !screenshotName.trim()) {
      setError('Enter UTR number and attach payment screenshot.')
      return
    }

    setLoading(true)
    try {
      const orderResponse = await api.post<LocalOrder>('/local/orders', {
        shop_id: cart[0].shop_id,
        items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
        student_name: session?.name || 'Student',
        student_phone: studentPhone.trim(),
        delivery_location: deliveryLocation,
        delivery_slot: deliverySlot,
        pending_payment: true,
      })

      await api.post<LocalPayment>('/local/payments', {
        order_id: orderResponse.data.id,
        amount: bill.total,
        method,
        utr_number: utrNumber,
        screenshot_name: screenshotName,
      })

      clearCart()
      navigate(`/order-result/${orderResponse.data.id}`)
    } catch {
      setError('Payment could not be completed. Check shop availability and payment configuration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fff7e6] px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="gold-sheen mb-6 rounded-lg border-4 border-yellow-500 p-6">
            <h1 className="text-4xl font-black text-green-950">Payment</h1>
            <p className="mt-2 font-bold text-green-800">{cart[0]?.shop_name || 'Cart checkout'}</p>
          </div>

          {!cart.length ? (
            <div className="rounded-lg border-2 border-yellow-500 bg-white p-8 text-center">
              <p className="mb-4 text-xl font-black text-green-950">Cart is empty.</p>
              <Link to="/shops" className="gold-button rounded-lg border-2 px-5 py-3 font-black">Browse restaurants</Link>
            </div>
          ) : (
            <form onSubmit={submitPayment} className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <section className="rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-md">
                <h2 className="mb-4 text-2xl font-black text-green-950">Delivery and payment</h2>
                <div className="space-y-4">
                  <input
                    value={deliveryLocation}
                    onChange={event => setDeliveryLocation(event.target.value)}
                    className="w-full rounded-lg border-2 border-yellow-600 px-4 py-3"
                    placeholder="Delivery location"
                    required
                  />
                  <input
                    value={studentPhone}
                    onChange={event => setStudentPhone(event.target.value)}
                    className="w-full rounded-lg border-2 border-yellow-600 px-4 py-3"
                    placeholder="Phone number"
                    type="tel"
                    required
                  />
                  <select value={deliverySlot} onChange={event => setDeliverySlot(event.target.value)} className="w-full rounded-lg border-2 border-yellow-600 px-4 py-3">
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                    <option>Night</option>
                  </select>
                  <div className="rounded-lg border-2 border-yellow-500 bg-yellow-50 p-4">
                    <p className="text-sm font-black text-green-950">Payment method</p>
                    {manualReady ? (
                      <div className="mt-3 rounded-lg border border-green-200 bg-white p-3 text-sm font-bold text-green-900">
                        <p>Pay to: {paymentSettings?.receiver_name || 'Campus merchant'}</p>
                        <p>UPI ID: {paymentSettings?.upi_id}</p>
                        {paymentSettings?.instructions && <p className="mt-1 text-green-700">{paymentSettings.instructions}</p>}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-bold text-red-700">
                        Admin has not configured a payment method yet. Orders are blocked until payment is configured.
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {['Manual UTR'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setMethod(option)}
                        disabled={!manualReady}
                        className={`rounded-lg border-2 px-4 py-3 font-black ${
                          method === option ? 'gold-button border-yellow-700' : 'border-yellow-500 bg-white text-green-900'
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {method === 'Manual UTR' && manualReady && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={utrNumber}
                        onChange={event => setUtrNumber(event.target.value)}
                        className="w-full rounded-lg border-2 border-yellow-600 px-4 py-3"
                        placeholder="UTR number"
                        required
                      />
                      <input
                        onChange={event => setScreenshotName(event.target.files?.[0]?.name || '')}
                        className="w-full rounded-lg border-2 border-yellow-600 px-4 py-3"
                        type="file"
                        accept="image/*"
                        required
                      />
                    </div>
                  )}
                </div>
                {error && <p className="mt-4 rounded-lg bg-red-50 p-3 font-bold text-red-700">{error}</p>}
              </section>

              <aside className="h-fit rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-md">
                <h2 className="mb-4 text-2xl font-black text-green-950">Payable</h2>
                <div className="space-y-2 font-bold text-green-900">
                  <div className="flex justify-between"><span>Items</span><span>{cart.length}</span></div>
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{bill.subtotal}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>₹{bill.tax}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>₹{bill.delivery}</span></div>
                  <div className="flex justify-between text-sm text-green-700"><span>Commission</span><span>₹{bill.platformFee}</span></div>
                  <div className="flex justify-between text-sm text-green-700"><span>Gateway fee</span><span>₹{bill.gatewayFee}</span></div>
                  <div className="flex justify-between text-sm text-green-700"><span>Vendor receives</span><span>₹{bill.vendorReceives}</span></div>
                  <div className="flex justify-between border-t-2 border-yellow-400 pt-3 text-xl font-black"><span>Total</span><span>₹{bill.total}</span></div>
                </div>
                <button disabled={loading || !manualReady} className="gold-button mt-5 w-full rounded-lg border-2 px-4 py-3 font-black disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Processing...' : manualReady ? `Submit payment ₹${bill.total}` : 'Payment not configured'}
                </button>
              </aside>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
