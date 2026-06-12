import { useEffect, useMemo, useState } from 'react'
import { MainLayout } from '../../components/Layout'
import api from '../../services/api'
import {
  LocalDatabaseStatus,
  LocalOrder,
  LocalPayment,
  LocalProduct,
  LocalShop,
  LocalSummary,
} from '../../types/localApi'
import { getLocalSession } from '../../utils/session'

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`

export function AdminDashboard() {
  const [shops, setShops] = useState<LocalShop[]>([])
  const [products, setProducts] = useState<LocalProduct[]>([])
  const [orders, setOrders] = useState<LocalOrder[]>([])
  const [payments, setPayments] = useState<LocalPayment[]>([])
  const [summary, setSummary] = useState<LocalSummary | null>(null)
  const [databaseStatus, setDatabaseStatus] = useState<LocalDatabaseStatus | null>(null)
  const [manualFallback, setManualFallback] = useState(false)
  const [message, setMessage] = useState('')
  const [loadError, setLoadError] = useState('')

  const session = getLocalSession()

  const loadAdmin = async () => {
    setLoadError('')
    try {
      const [shopsResponse, productsResponse, ordersResponse, paymentsResponse, summaryResponse, statusResponse] = await Promise.all([
        api.get<LocalShop[]>('/local/shops'),
        api.get<LocalProduct[]>('/local/products'),
        api.get<LocalOrder[]>('/local/orders'),
        api.get<LocalPayment[]>('/local/payments'),
        api.get<LocalSummary>('/local/summary'),
        api.get<LocalDatabaseStatus>('/local/status'),
      ])
      setShops(shopsResponse.data)
      setProducts(productsResponse.data)
      setOrders(ordersResponse.data)
      setPayments(paymentsResponse.data)
      setSummary(summaryResponse.data)
      setDatabaseStatus(statusResponse.data)
    } catch {
      setLoadError('Backend is not reachable. Check the API deployment and database settings.')
    }
  }

  useEffect(() => {
    void loadAdmin()
  }, [])

  const pendingShops = shops.filter(shop => shop.approval_status === 'Pending Approval')
  const approvedShops = shops.filter(shop => shop.approval_status === 'Approved')
  const activeShops = shops.filter(shop => shop.approval_status === 'Approved' && shop.present && shop.status === 'Open')
  const pendingPrices = products.filter(product => product.pending_price)
  const pendingPayments = payments.filter(payment => payment.status === 'Pending Verification')
  const totalRevenue = summary?.revenue ?? orders.reduce((sum, order) => sum + order.total, 0)
  const totalCommission = Math.round(totalRevenue * 0.05)
  const gatewayFees = Math.round(totalRevenue * 0.02)
  const vendorRevenue = totalRevenue - totalCommission - gatewayFees
  const reviewCount = pendingShops.length + pendingPrices.length + pendingPayments.length

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
      <div className="min-h-screen bg-[#f8fbf6] px-3 py-5 text-green-950 sm:px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_320px]">
            <section className="rounded-lg border border-green-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-yellow-700">Campus operations</p>
                  <h1 className="mt-1 text-2xl font-black text-green-950 md:text-3xl">Admin Dashboard</h1>
                  <p className="mt-1 text-sm font-semibold text-green-700">Approvals, payments, shop status, and live data health.</p>
                </div>
                <label className="inline-flex w-fit items-center gap-2 rounded-lg border border-yellow-500 bg-yellow-50 px-3 py-2 text-xs font-black text-green-950">
                  <input
                    type="checkbox"
                    checked={manualFallback}
                    onChange={event => setManualFallback(event.target.checked)}
                    className="h-4 w-4"
                  />
                  Manual fallback {manualFallback ? 'ON' : 'OFF'}
                </label>
              </div>
              {(message || loadError) && (
                <div className={`mt-3 rounded-lg border px-3 py-2 text-sm font-bold ${
                  loadError ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-300 bg-green-50 text-green-800'
                }`}>
                  {loadError || message}
                </div>
              )}
            </section>

            <aside className="rounded-lg border border-green-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-950 text-xl font-black text-yellow-300">
                  A
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-green-950">{session?.name || 'Campus Admin'}</p>
                  <p className="truncate text-xs font-bold text-green-700">{session?.email || '12@gmail.com'}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black">
                <span className="rounded-lg bg-green-50 px-2 py-2 text-green-800">Approver</span>
                <span className="rounded-lg bg-yellow-50 px-2 py-2 text-yellow-800">Verifier</span>
                <span className="rounded-lg bg-slate-100 px-2 py-2 text-slate-700">Auditor</span>
              </div>
            </aside>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {[
              ['Orders', orders.length],
              ['Revenue', money(totalRevenue)],
              ['Commission', money(totalCommission)],
              ['Fees', money(gatewayFees)],
              ['Vendor', money(vendorRevenue)],
              ['Reviews', reviewCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-green-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-black uppercase text-green-600">{label}</p>
                <p className="mt-1 truncate text-xl font-black text-green-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_1fr_320px]">
            <section className="rounded-lg border border-green-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-green-100 pb-2">
                <h2 className="text-lg font-black text-green-950">Shop Approvals</h2>
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-black text-yellow-800">{pendingShops.length}</span>
              </div>
              <div className="space-y-2">
                {pendingShops.map(shop => (
                  <div key={shop.id} className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-green-950">{shop.name}</p>
                        <p className="truncate text-xs font-bold text-green-700">{shop.category} · {shop.shopkeeper_name}</p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-yellow-800">Pending</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => void updateShopApproval(shop.id, 'Approved')} className="rounded-lg bg-green-800 px-3 py-2 text-xs font-black text-white">
                        Approve
                      </button>
                      <button onClick={() => void updateShopApproval(shop.id, 'Rejected')} className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-black text-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingShops.length === 0 && <p className="text-sm font-bold text-green-700">No pending shops.</p>}
              </div>
            </section>

            <section className="rounded-lg border border-green-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-green-100 pb-2">
                <h2 className="text-lg font-black text-green-950">Price Requests</h2>
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-black text-yellow-800">{pendingPrices.length}</span>
              </div>
              <div className="space-y-2">
                {pendingPrices.map(product => (
                  <div key={product.id} className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <p className="truncate text-sm font-black text-green-950">{product.name}</p>
                    <p className="mb-2 text-xs font-bold text-yellow-800">
                      {shopById[product.shop_id]?.name || 'Shop'} · {money(product.price)} to {money(product.pending_price || 0)}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => void approvePrice(product)} className="rounded-lg bg-green-800 px-3 py-2 text-xs font-black text-white">
                        Approve
                      </button>
                      <button onClick={() => void rejectPrice(product)} className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-black text-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingPrices.length === 0 && <p className="text-sm font-bold text-green-700">No pending prices.</p>}
              </div>
            </section>

            <section className="rounded-lg border border-green-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 border-b border-green-100 pb-2 text-lg font-black text-green-950">Database</h2>
              <div className={`rounded-lg border p-3 ${
                databaseStatus?.mode === 'mongo'
                  ? 'border-green-300 bg-green-50'
                  : 'border-yellow-300 bg-yellow-50'
              }`}>
                <p className="text-xs font-black uppercase text-green-700">
                  {databaseStatus?.connected ? 'Connected' : 'Not connected'}
                </p>
                <p className="mt-1 text-base font-black text-green-950">{databaseStatus?.database || 'Checking database'}</p>
                <p className="mt-2 text-xs font-bold text-green-700">{databaseStatus?.message || 'Waiting for backend status.'}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black">
                <span className="rounded-lg bg-slate-100 px-2 py-2 text-slate-700">Shops {summary?.shops ?? shops.length}</span>
                <span className="rounded-lg bg-slate-100 px-2 py-2 text-slate-700">Products {summary?.products ?? products.length}</span>
                <span className="rounded-lg bg-slate-100 px-2 py-2 text-slate-700">Open {summary?.orderable_shops ?? activeShops.length}</span>
                <span className="rounded-lg bg-slate-100 px-2 py-2 text-slate-700">Token {summary?.token_starts_at ?? '-'}</span>
              </div>
            </section>
          </div>

          <div className="mb-4 overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm">
            <div className="flex flex-col gap-1 border-b border-green-100 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-black text-green-950">Shops And Revenue</h2>
              <p className="text-xs font-bold text-green-700">{activeShops.length} active · {approvedShops.length} approved</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-green-50">
                  <tr>
                    {['Shop', 'Approval', 'Present', 'Status', 'Orders', 'Revenue'].map(column => (
                      <th key={column} className="px-4 py-2 text-left text-xs font-black uppercase text-green-800">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approvedShops.map(shop => (
                    <tr key={shop.id} className="border-t border-green-100">
                      <td className="px-4 py-3 font-black text-green-950">{shop.name}</td>
                      <td className="px-4 py-3 text-green-800">{shop.approval_status}</td>
                      <td className="px-4 py-3 text-green-800">{shop.present ? 'ON' : 'OFF'}</td>
                      <td className="px-4 py-3 text-green-800">{shop.status}</td>
                      <td className="px-4 py-3 text-green-800">{shop.orders_today}</td>
                      <td className="px-4 py-3 font-black text-yellow-700">{money(shop.revenue_today)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <section className="rounded-lg border border-green-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-1 border-b border-green-100 pb-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-black text-green-950">Manual Payment Verification</h2>
              <p className="text-xs font-bold text-green-700">{manualFallback ? 'Fallback enabled' : 'Razorpay primary'}</p>
            </div>
            <div className="space-y-2">
              {pendingPayments.map(payment => (
                <div key={payment.id} className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-green-950">{payment.id} · Order {payment.order_id}</p>
                      <p className="truncate text-xs font-bold text-green-800">
                        {money(payment.amount)} · {payment.method} · UTR {payment.utr_number || 'missing'} · {payment.screenshot_name || 'no screenshot'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => void updatePaymentStatus(payment.id, 'Success')} className="rounded-lg bg-green-800 px-3 py-2 text-xs font-black text-white">
                        Verify
                      </button>
                      <button onClick={() => void updatePaymentStatus(payment.id, 'Failed')} className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-black text-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingPayments.length === 0 && <p className="text-sm font-bold text-green-700">No manual payments waiting.</p>}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}
