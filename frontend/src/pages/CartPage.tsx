import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/Layout'
import { getCart, StoredCartItem, updateCartQuantity } from '../utils/cart'
import { getBillBreakdown } from '../utils/billing'

export function CartPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<StoredCartItem[]>(() => getCart())
  const bill = getBillBreakdown(items)

  useEffect(() => {
    const sync = () => setItems(getCart())
    window.addEventListener('detomsite-cart-updated', sync)
    return () => window.removeEventListener('detomsite-cart-updated', sync)
  }, [])

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(updateCartQuantity(productId, quantity))
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fff7e6] px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="gold-sheen mb-6 rounded-lg border-4 border-yellow-500 p-6">
            <h1 className="text-4xl font-black text-green-950">Cart</h1>
            <p className="mt-2 font-bold text-green-800">{items[0]?.shop_name || 'No restaurant selected'}</p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border-2 border-yellow-500 bg-white p-8 text-center">
              <p className="mb-4 text-xl font-black text-green-950">Your cart is empty.</p>
              <Link to="/shops" className="gold-button rounded-lg border-2 px-5 py-3 font-black">Browse restaurants</Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
              <section className="space-y-4">
                {items.map(item => (
                  <div key={item.product_id} className="rounded-lg border-2 border-yellow-500 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-xl font-black text-green-950">{item.name}</h2>
                        <p className="font-bold text-green-700">{item.category} · ₹{item.price}</p>
                      </div>
                      <div className="flex items-center justify-between gap-5">
                        <div className="flex items-center rounded border-2 border-green-700">
                          <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="px-3 py-1 font-black text-green-900">-</button>
                          <span className="px-4 font-black text-green-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="px-3 py-1 font-black text-green-900">+</button>
                        </div>
                        <p className="min-w-20 text-right text-xl font-black text-yellow-700">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              <aside className="h-fit rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-md">
                <h2 className="mb-4 text-2xl font-black text-green-950">Bill details</h2>
                <div className="space-y-2 font-bold text-green-900">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{bill.subtotal}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>₹{bill.tax}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>₹{bill.delivery}</span></div>
                  <div className="flex justify-between text-sm text-green-700"><span>Platform commission</span><span>₹{bill.platformFee}</span></div>
                  <div className="flex justify-between text-sm text-green-700"><span>Gateway fee</span><span>₹{bill.gatewayFee}</span></div>
                  <div className="flex justify-between border-t-2 border-yellow-400 pt-3 text-xl font-black"><span>Total</span><span>₹{bill.total}</span></div>
                </div>
                <button
                  onClick={() => navigate('/payment')}
                  className="gold-button mt-5 w-full rounded-lg border-2 px-4 py-3 font-black"
                >
                  Go to payment
                </button>
              </aside>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
