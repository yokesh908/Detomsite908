import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MainLayout } from '../components/Layout'
import api from '../services/api'
import { canOrderFromShop, LocalShop, shopStatusText } from '../types/localApi'

const cardGradients = [
  'from-orange-500 to-red-600',
  'from-yellow-400 to-orange-600',
  'from-green-600 to-emerald-900',
  'from-amber-500 to-yellow-700',
]

export function Shops() {
  const [shops, setShops] = useState<LocalShop[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('rating')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<LocalShop[]>('/local/shops', { params: { public_only: true } })
      .then(response => setShops(response.data))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['all', ...new Set(shops.map(shop => shop.category))], [shops])
  const filteredShops = shops
    .filter(shop => filter === 'all' || shop.category === filter)
    .filter(shop => `${shop.name} ${shop.category}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'status') return Number(canOrderFromShop(b)) - Number(canOrderFromShop(a))
      return b.rating - a.rating
    })
  const pageSize = 8
  const pageCount = Math.max(1, Math.ceil(filteredShops.length / pageSize))
  const visibleShops = filteredShops.slice((page - 1) * pageSize, page * pageSize)

  const handleFilter = (category: string) => {
    setFilter(category)
    setPage(1)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fff7e6] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="gold-sheen mb-6 rounded-lg border-4 border-yellow-500 p-5">
            <h1 className="text-4xl font-black text-green-950">Restaurants</h1>
            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_170px]">
              <input
                value={search}
                onChange={event => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search for restaurants or food"
                className="rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 text-green-950 outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <select
                value={sort}
                onChange={event => setSort(event.target.value)}
                className="rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 text-green-950 outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="rating">Rating</option>
                <option value="status">Open first</option>
                <option value="name">Name</option>
              </select>
              <div className="rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 font-black text-green-950">
                {filteredShops.length} shops
              </div>
            </div>
          </div>

          <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleFilter(category)}
                className={`rounded-full border-2 px-5 py-2 font-black whitespace-nowrap transition ${
                  filter === category
                    ? 'gold-button border-yellow-700'
                    : 'border-yellow-500 bg-white text-green-900 hover:bg-yellow-50'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-lg bg-white p-8 text-center font-black text-green-950">Loading restaurants...</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {visibleShops.map((shop, index) => (
                <Link
                  key={shop.id}
                  to={`/shop/${shop.id}`}
                  className="overflow-hidden rounded-lg border-2 border-yellow-500 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`h-40 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-green-950">{shop.name}</h3>
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
              {visibleShops.length === 0 && (
                <div className="rounded-lg border-2 border-yellow-500 bg-white p-8 text-center font-black text-green-950 md:col-span-2 lg:col-span-4">
                  No approved open shops are available right now.
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-lg border-2 border-yellow-600 bg-white px-4 py-2 font-black text-green-900 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(pageCount, page + 1))}
              disabled={page === pageCount}
              className="rounded-lg border-2 border-yellow-600 bg-white px-4 py-2 font-black text-green-900 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
