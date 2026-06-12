import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MainLayout } from '../components/Layout'
import api from '../services/api'
import { canOrderFromShop, LocalOrder, LocalProduct, LocalShop, shopStatusText } from '../types/localApi'
import { getLocalSession } from '../utils/session'

interface BackendSummary {
  shops: number
  orderable_shops: number
  products: number
  active_orders: number
  revenue: number
  token_starts_at: number
}

const categoryStyles = [
  'from-orange-500 to-red-600',
  'from-yellow-400 to-orange-600',
  'from-green-500 to-emerald-800',
  'from-amber-500 to-yellow-700',
  'from-rose-500 to-orange-500',
]

export function Home() {
  const session = getLocalSession()
  const [summary, setSummary] = useState<BackendSummary | null>(null)
  const [shops, setShops] = useState<LocalShop[]>([])
  const [products, setProducts] = useState<LocalProduct[]>([])
  const [orders, setOrders] = useState<LocalOrder[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    void Promise.all([
      api.get<BackendSummary>('/local/summary'),
      api.get<LocalShop[]>('/local/shops'),
      api.get<LocalProduct[]>('/local/products'),
      api.get<LocalOrder[]>('/local/orders'),
    ]).then(([summaryResponse, shopsResponse, productsResponse, ordersResponse]) => {
      setSummary(summaryResponse.data)
      setShops(shopsResponse.data)
      setProducts(productsResponse.data)
      setOrders(ordersResponse.data)
    }).catch(() => {
      setSummary(null)
    })
  }, [])

  const categories = useMemo(() => (
    Array.from(new Set(shops.map(shop => shop.category))).slice(0, 5)
  ), [shops])

  const filteredShops = shops.filter(shop => (
    `${shop.name} ${shop.category}`.toLowerCase().includes(search.toLowerCase())
  ))

  const topProducts = products.slice(0, 6)

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fff7e6] px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <section className="gold-sheen rounded-lg border-4 border-yellow-500 p-5 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-[0.22em] text-yellow-700">
                  {session ? `${session.role} · ${session.email}` : 'Food delivery'}
                </p>
                <h1 className="text-5xl font-black tracking-tight text-green-950 md:text-7xl">
                  DETOMSITE
                </h1>
                <div className="mt-6 flex max-w-2xl overflow-hidden rounded-lg border-3 border-yellow-600 bg-white shadow-lg">
                  <input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    className="min-w-0 flex-1 px-5 py-4 text-green-950 outline-none"
                    placeholder="Search shops, meals, snacks"
                  />
                  <Link
                    to="/shops"
                    className="gold-button flex items-center px-5 py-4 font-black"
                  >
                    Search
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {topProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/shop/${product.shop_id}`}
                    className="overflow-hidden rounded-lg border-2 border-yellow-500 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className={`h-24 bg-gradient-to-br ${categoryStyles[index % categoryStyles.length]}`} />
                    <div className="p-3">
                      <p className="truncate font-black text-green-950">{product.name}</p>
                      <p className="text-sm font-bold text-yellow-700">₹{product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              ['Open shops', summary?.orderable_shops ?? 0],
              ['Menu items', summary?.products ?? products.length],
              ['Active orders', summary?.active_orders ?? orders.filter(order => order.status !== 'Completed').length],
              ['Token starts', summary?.token_starts_at ?? 18],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border-2 border-yellow-500 bg-white p-4 shadow-sm">
                <p className="text-sm font-black text-yellow-700">{label}</p>
                <p className="mt-1 text-3xl font-black text-green-950">{value}</p>
              </div>
            ))}
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-3xl font-black text-green-950">What is on your mind?</h2>
              <Link to="/shops" className="font-black text-yellow-700 hover:text-yellow-800">View all</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((category, index) => (
                <Link
                  key={category}
                  to="/shops"
                  className="min-w-[150px] overflow-hidden rounded-lg border-2 border-yellow-500 bg-white shadow-sm"
                >
                  <div className={`h-24 bg-gradient-to-br ${categoryStyles[index % categoryStyles.length]}`} />
                  <div className="p-3 text-center font-black text-green-950">{category}</div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 text-3xl font-black text-green-950">Restaurants near you</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {filteredShops.map((shop, index) => (
                <Link
                  key={shop.id}
                  to={`/shop/${shop.id}`}
                  className="overflow-hidden rounded-lg border-2 border-yellow-500 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`h-36 bg-gradient-to-br ${categoryStyles[index % categoryStyles.length]}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-green-950">{shop.name}</h3>
                        <p className="text-sm font-bold text-green-700">{shop.category}</p>
                      </div>
                      <span className="rounded bg-green-700 px-2 py-1 text-xs font-black text-white">
                        {shop.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm font-black">
                      <span className={canOrderFromShop(shop) ? 'text-green-700' : 'text-yellow-700'}>
                        {shopStatusText(shop)}
                      </span>
                      <span className="text-green-800">{shop.opening_time}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}
