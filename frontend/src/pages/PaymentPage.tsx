import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/Layout'
import api from '../services/api'
import { LocalOrder, LocalPayment } from '../types/localApi'
import { clearCart, getCart } from '../utils/cart'
import { getBillBreakdown } from '../utils/billing'
import { getLocalSession } from '../utils/session'

export function PaymentPage() {
  const navigate = useNavigate()
  const session = getLocalSession()
  const [method, setMethod] = useState('Razorpay')
  const [utrNumber, setUtrNumber] = useState('')
  const [screenshotName, setScreenshotName] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState(session?.default_delivery_location || 'Hostel A Block 201')
  const [deliverySlot, setDeliverySlot] = useState('Evening')
  const [studentPhone, setStudentPhone] = useState(session?.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cart = getCart()
  const bill = getBillBreakdown(cart)

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!cart.length) {
      setError('Cart is empty.')
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
      })

      await api.post<LocalPayment>('/local/payments', {
        order_id: orderResponse.data.id,
        amount: bill.total,
        method,
        utr_number: method === 'Manual UTR' ? utrNumber : null,
        screenshot_name: method === 'Manual UTR' ? screenshotName : null,
      })

      clearCart()
      navigate(`/order-result/${orderResponse.data.id}`)
    } catch {
      setError('Payment could not be completed. Please try again.')
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
                  <div className="grid gap-3 md:grid-cols-3">
                    {['Razorpay', 'UPI', 'Manual UTR'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setMethod(option)}
                        className={`rounded-lg border-2 px-4 py-3 font-black ${
                          method === option ? 'gold-button border-yellow-700' : 'border-yellow-500 bg-white text-green-900'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {method === 'Manual UTR' && (
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
                <button disabled={loading} className="gold-button mt-5 w-full rounded-lg border-2 px-4 py-3 font-black disabled:opacity-50">
                  {loading ? 'Processing...' : `Pay ₹${bill.total}`}
                </button>
              </aside>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
