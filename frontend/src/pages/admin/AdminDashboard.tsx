import { useEffect, useMemo, useState } from 'react'
import { MainLayout } from '../../components/Layout'
import api from '../../services/api'
import { LocalOrder, LocalPayment, LocalProduct, LocalShop } from '../../types/localApi'

export function AdminDashboard() {
  const [shops, setShops] = useState<LocalShop[]>([])
  const [products, setProducts] = useState<LocalProduct[]>([])
  const [orders, setOrders] = useState<LocalOrder[]>([])
  const [payments, setPayments] = useState<LocalPayment[]>([])
  const [manualFallback, setManualFallback] = useState(false)
  const [message, setMessage] = useState('')

  const loadAdmin = async () => {
    const [shopsResponse, productsResponse, ordersResponse, paymentsResponse] = await Promise.all([
      api.get<LocalShop[]>('/local/shops'),
      api.get<LocalProduct[]>('/local/products'),
      api.get<LocalOrder[]>('/local/orders'),
      api.get<LocalPayment[]>('/local/payments'),
    ])
    setShops(shopsResponse.data)
    setProducts(productsResponse.data)
    setOrders(ordersResponse.data)
    setPayments(paymentsResponse.data)
  }

  useEffect(() => {
    void loadAdmin()
  }, [])

  const pendingShops = shops.filter(shop => shop.approval_status === 'Pending Approval')
  const approvedShops = shops.filter(shop => shop.approval_status === 'Approved')
  const activeShops = shops.filter(shop => shop.approval_status === 'Approved' && shop.present && shop.status === 'Open')
  const pendingPrices = products.filter(product => product.pending_price)
  const pendingPayments = payments.filter(payment => payment.status === 'Pending Verification')
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalCommission = Math.round(totalRevenue * 0.05)
  const gatewayFees = Math.round(totalRevenue * 0.02)
  const vendorRevenue = totalRevenue - totalCommission - gatewayFees

  const shopById = useMemo(() => (
    Object.fromEntries(shops.map(shop => [shop.id, shop]))
  ), [shops])

  const updateShopApproval = async (shopId: string, approvalStatus: string) => {
    const response = await api.patch<LocalShop>(`/local/shops/${shopId}`, { approval_status: approvalStatus })
    setShops(current => current.map(shop => shop.id === shopId ? response.data : shop))
    setMessage(`Shop ${approvalStatus.toLowerCase()}.`)
  }

  const approvePrice = async (product: LocalProduct) => {
    if (!product.pending_price) return
    const response = await api.patch<LocalProduct>(`/local/products/${product.id}`, {
      price: product.pending_price,
      pending_price: null,
    })
    setProducts(current => current.map(item => item.id === product.id ? response.data : item))
    setMessage('Price approved.')
  }

  const rejectPrice = async (product: LocalProduct) => {
    const response = await api.patch<LocalProduct>(`/local/products/${product.id}`, { pending_price: null })
    setProducts(current => current.map(item => item.id === product.id ? response.data : item))
    setMessage('Price request rejected.')
  }

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    const response = await api.patch<LocalPayment>(`/local/payments/${paymentId}/status`, { status })
    setPayments(current => current.map(payment => payment.id === paymentId ? response.data : payment))
    setMessage(`Payment marked ${status.toLowerCase()}.`)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fff7e6] px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="gold-sheen mb-8 rounded-lg border-4 border-yellow-500 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-black text-green-950">Admin Dashboard</h1>
                <p className="mt-2 font-bold text-green-800">Approvals, prices, orders, payments</p>
              </div>
              <label className="flex items-center gap-3 rounded-lg border-2 border-yellow-600 bg-white/85 px-4 py-3 font-black text-green-950">
                Manual payment fallback
                <input
                  type="checkbox"
                  checked={manualFallback}
                  onChange={event => setManualFallback(event.target.checked)}
                  className="h-5 w-5"
                />
                {manualFallback ? 'ON' : 'OFF'}
              </label>
            </div>
            {message && (
              <div className="mt-4 rounded-lg border-2 border-yellow-500 bg-white px-4 py-3 font-bold text-green-900">
                {message}
              </div>
            )}
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            {[
              ['Total orders', orders.length],
              ['Revenue', `₹${totalRevenue}`],
              ['Commission', `₹${totalCommission}`],
              ['Razorpay fees', `₹${gatewayFees}`],
              ['Vendor revenue', `₹${vendorRevenue}`],
              ['Active shops', activeShops.length],
              ['Pending reviews', pendingShops.length + pendingPrices.length + pendingPayments.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-sm">
                <p className="text-sm font-black text-yellow-700">{label}</p>
                <p className="mt-2 text-3xl font-black text-green-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border-2 border-yellow-500 bg-white p-6 shadow-md">
              <h2 className="mb-4 border-b-2 border-yellow-400 pb-3 text-2xl font-black text-green-950">
                Shop approvals
              </h2>
              <div className="space-y-3">
                {pendingShops.map(shop => (
                  <div key={shop.id} className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                    <div className="mb-3 flex justify-between gap-4">
                      <div>
                        <p className="font-black text-green-950">{shop.name}</p>
                        <p className="text-sm font-bold text-green-700">{shop.category} · {shop.shopkeeper_name}</p>
                      </div>
                      <span className="h-fit rounded-full bg-yellow-200 px-3 py-1 text-xs font-black text-yellow-900">
                        Pending
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => void updateShopApproval(shop.id, 'Approved')} className="rounded-lg border-2 border-green-800 bg-green-700 px-3 py-2 font-black text-white">
                        Approve
                      </button>
                      <button onClick={() => void updateShopApproval(shop.id, 'Rejected')} className="rounded-lg border-2 border-red-600 bg-red-100 px-3 py-2 font-black text-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingShops.length === 0 && <p className="font-bold text-green-800">No pending shop approvals.</p>}
              </div>
            </div>

            <div className="rounded-lg border-2 border-yellow-500 bg-white p-6 shadow-md">
              <h2 className="mb-4 border-b-2 border-yellow-400 pb-3 text-2xl font-black text-green-950">
                Price approvals
              </h2>
              <div className="space-y-3">
                {pendingPrices.map(product => (
                  <div key={product.id} className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                    <p className="font-black text-green-950">{product.name}</p>
                    <p className="mb-3 text-sm font-bold text-yellow-800">
                      {shopById[product.shop_id]?.name} requests ₹{product.pending_price}. Current price ₹{product.price}.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => void approvePrice(product)} className="rounded-lg border-2 border-green-800 bg-green-700 px-3 py-2 font-black text-white">
                        Approve
                      </button>
                      <button onClick={() => void rejectPrice(product)} className="rounded-lg border-2 border-red-600 bg-red-100 px-3 py-2 font-black text-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingPrices.length === 0 && <p className="font-bold text-green-800">No pending price approvals.</p>}
              </div>
            </div>
          </div>

          <div className="mb-8 overflow-hidden rounded-lg border-2 border-yellow-500 bg-white shadow-md">
            <div className="border-b-2 border-yellow-400 p-5">
              <h2 className="text-2xl font-black text-green-950">Shops and revenue</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-yellow-50">
                  <tr>
                    {['Shop', 'Approval', 'Present', 'Status', 'Orders', 'Revenue'].map(column => (
                      <th key={column} className="px-5 py-3 text-left font-black text-green-950">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approvedShops.map(shop => (
                    <tr key={shop.id} className="border-t border-yellow-100">
                      <td className="px-5 py-4 font-black text-green-950">{shop.name}</td>
                      <td className="px-5 py-4 text-green-800">{shop.approval_status}</td>
                      <td className="px-5 py-4 text-green-800">{shop.present ? 'ON' : 'OFF'}</td>
                      <td className="px-5 py-4 text-green-800">{shop.status}</td>
                      <td className="px-5 py-4 text-green-800">{shop.orders_today}</td>
                      <td className="px-5 py-4 font-black text-yellow-700">₹{shop.revenue_today}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8 rounded-lg border-2 border-yellow-500 bg-white p-6 shadow-md">
            <h2 className="mb-3 text-2xl font-black text-green-950">Manual payment verification</h2>
            <p className="font-bold text-green-800">
              {manualFallback
                ? 'Customers can submit UTR number and screenshot. Admin must verify before order acceptance.'
                : 'Manual fallback is off. Razorpay remains the primary payment flow.'}
            </p>
            <div className="mt-5 space-y-3">
              {pendingPayments.map(payment => (
                <div key={payment.id} className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-black text-green-950">{payment.id} · Order {payment.order_id}</p>
                      <p className="text-sm font-bold text-green-800">
                        ₹{payment.amount} · {payment.method} · UTR {payment.utr_number || 'missing'} · {payment.screenshot_name || 'no screenshot'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => void updatePaymentStatus(payment.id, 'Success')} className="rounded-lg border-2 border-green-800 bg-green-700 px-3 py-2 font-black text-white">
                        Verify
                      </button>
                      <button onClick={() => void updatePaymentStatus(payment.id, 'Failed')} className="rounded-lg border-2 border-red-600 bg-red-100 px-3 py-2 font-black text-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingPayments.length === 0 && <p className="font-bold text-green-800">No manual payments waiting.</p>}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
