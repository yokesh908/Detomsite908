import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MainLayout } from '../components/Layout'
import api from '../services/api'
import { LocalOrder, LocalPayment, LocalShop } from '../types/localApi'

const statusTone: Record<string, string> = {
  'Pending Acceptance': 'bg-yellow-100 text-yellow-800 border-yellow-500',
  Confirmed: 'bg-green-100 text-green-800 border-green-600',
  Preparing: 'bg-yellow-100 text-yellow-800 border-yellow-500',
  Ready: 'bg-green-100 text-green-800 border-green-600',
  Completed: 'bg-green-700 text-white border-green-800',
  Cancelled: 'bg-red-100 text-red-700 border-red-600',
}

export function OrderResultPage() {
  const { orderId = '' } = useParams()
  const [order, setOrder] = useState<LocalOrder | null>(null)
  const [shop, setShop] = useState<LocalShop | null>(null)
  const [payment, setPayment] = useState<LocalPayment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = () => {
      api.get<LocalOrder>(`/local/orders/${orderId}`)
        .then(async response => {
          setOrder(response.data)
          const [shopResponse, paymentsResponse] = await Promise.all([
            api.get<LocalShop>(`/local/shops/${response.data.shop_id}`),
            api.get<LocalPayment[]>('/local/payments'),
          ])
          setShop(shopResponse.data)
          setPayment(paymentsResponse.data.find(item => item.order_id === response.data.id) || null)
        })
        .catch(() => {
          setOrder(null)
          setShop(null)
          setPayment(null)
        })
        .finally(() => setLoading(false))
    }

    loadOrder()
    const timer = window.setInterval(loadOrder, 5000)
    return () => window.clearInterval(timer)
  }, [orderId])

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fff7e6] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="gold-sheen rounded-lg border-4 border-yellow-500 p-6 text-center">
            {loading ? (
              <p className="font-black text-green-950">Loading order result...</p>
            ) : order ? (
              <>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-700">Order result</p>
                <h1 className="mt-3 text-5xl font-black text-green-950">Token {order.token}</h1>
                <p className="mt-3 text-xl font-black text-green-900">{order.shop_name}</p>
                <span className={`mt-5 inline-flex rounded-full border-2 px-5 py-2 font-black ${statusTone[order.status] || 'bg-white text-green-900 border-yellow-500'}`}>
                  {order.status}
                </span>
                {order.status === 'Completed' && (
                  <div className="mt-5 rounded-lg border-2 border-green-700 bg-green-50 p-4 text-left font-black text-green-900">
                    Your order is completed. Please collect Token {order.token}.
                  </div>
                )}
                <div className="mt-6 rounded-lg border-2 border-yellow-500 bg-white p-5 text-left font-bold text-green-900">
                  <p>{order.items}</p>
                  <p className="mt-2">{order.student_phone || 'No phone added'}</p>
                  <p className="mt-2">{order.delivery_location}</p>
                  <p className="mt-2">{order.delivery_slot}</p>
                  <p className="mt-2">Payment: {payment?.status || 'Pending'}</p>
                  {shop && (
                    <div className="mt-4 rounded-lg bg-green-50 p-4">
                      <p>Shopkeeper: {shop.shopkeeper_name}</p>
                      <p>Phone: {shop.phone}</p>
                      <a href={`tel:${shop.phone}`} className="mt-3 inline-flex rounded-lg border-2 border-green-800 bg-green-700 px-4 py-2 font-black text-white">
                        Call shopkeeper
                      </a>
                    </div>
                  )}
                  <p className="mt-2 text-xl font-black text-yellow-700">₹{order.total}</p>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link to="/customer-dashboard" className="gold-button rounded-lg border-2 px-5 py-3 font-black">Track order</Link>
                  <Link to="/shops" className="rounded-lg border-2 border-yellow-500 bg-white px-5 py-3 font-black text-green-900">Order more</Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-black text-green-950">Order not found</h1>
                <Link to="/shops" className="gold-button mt-5 inline-flex rounded-lg border-2 px-5 py-3 font-black">Browse restaurants</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
