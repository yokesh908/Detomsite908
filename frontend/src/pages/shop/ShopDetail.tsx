import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MainLayout } from '../../components/Layout'
import api from '../../services/api'
import { canOrderFromShop, LocalProduct, LocalShop, shopStatusText } from '../../types/localApi'
import { addProductToCart, getCart, StoredCartItem, updateCartQuantity } from '../../utils/cart'
import { getBillBreakdown } from '../../utils/billing'

const itemGradients = [
  'from-orange-500 to-red-600',
  'from-yellow-400 to-orange-600',
  'from-green-600 to-emerald-900',
  'from-amber-500 to-yellow-700',
]

export function ShopDetail() {
  const { shopId = '1' } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState<LocalShop | null>(null)
  const [products, setProducts] = useState<LocalProduct[]>([])
  const [cart, setCart] = useState<StoredCartItem[]>(() => getCart())
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('popular')
  const [availability, setAvailability] = useState('all')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get<LocalShop>(`/local/shops/${shopId}`),
      api.get<LocalProduct[]>('/local/products', { params: { shop_id: shopId } }),
    ]).then(([shopResponse, productResponse]) => {
      setShop(shopResponse.data)
      setProducts(productResponse.data)
      setMessage('')
    }).catch(() => {
      setMessage('Unable to load this shop from the backend.')
    }).finally(() => setLoading(false))
  }, [shopId])

  const categories = useMemo(() => ['all', ...new Set(products.map(product => product.category))], [products])
  const filteredItems = products
    .filter(product => filter === 'all' || product.category === filter)
    .filter(product => (
      availability === 'all' ||
      (availability === 'available'
        ? Boolean(product.available) && product.inventory > 0
        : !product.available || product.inventory === 0)
    ))
    .filter(product => `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price
      if (sort === 'price-high') return b.price - a.price
      if (sort === 'newest') return b.id.localeCompare(a.id)
      return b.inventory - a.inventory
    })
  const orderable = shop ? canOrderFromShop(shop) : false
  const shopCart = shop ? cart.filter(item => item.shop_id === shop.id) : []
  const bill = getBillBreakdown(shopCart)

  const addToCart = (item: LocalProduct) => {
    if (!shop || !orderable || !item.available || item.inventory === 0) return
    setCart(addProductToCart(item, shop))
    setMessage(`${item.name} added to cart.`)
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart(updateCartQuantity(itemId, quantity))
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#fff7e6] px-4 py-12 text-center font-black text-green-950">
          Loading menu...
        </div>
      </MainLayout>
    )
  }

  if (!shop) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#fff7e6] px-4 py-12 text-center font-black text-green-950">
          Shop not found.
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fff7e6] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="gold-sheen mb-6 rounded-lg border-4 border-yellow-500 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <button onClick={() => navigate('/shops')} className="mb-4 font-black text-yellow-700">
                  Back to restaurants
                </button>
                <h1 className="text-4xl font-black text-green-950">{shop.name}</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-sm font-black">
                  <span className="rounded bg-green-700 px-3 py-1 text-white">{shop.rating.toFixed(1)} rating</span>
                  <span className="rounded bg-white px-3 py-1 text-green-900">{shop.category}</span>
                  <span className="rounded bg-white px-3 py-1 text-green-900">{shop.opening_time} - {shop.closing_time}</span>
                  <span className={orderable ? 'rounded bg-green-100 px-3 py-1 text-green-800' : 'rounded bg-yellow-100 px-3 py-1 text-yellow-800'}>
                    {shopStatusText(shop)}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border-2 border-yellow-600 bg-white/85 px-4 py-3 text-sm font-black text-green-950">
                Token starts at 18 daily
              </div>
            </div>
            {message && (
              <div className="mt-4 rounded-lg border-2 border-yellow-500 bg-white px-4 py-3 font-bold text-green-900">
                {message}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section>
              <div className="mb-4 grid gap-3 rounded-lg border-2 border-yellow-500 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px]">
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  className="rounded-lg border-2 border-yellow-600 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Search menu items"
                />
                <select value={sort} onChange={event => setSort(event.target.value)} className="rounded-lg border-2 border-yellow-600 px-4 py-3">
                  <option value="popular">Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price low to high</option>
                  <option value="price-high">Price high to low</option>
                </select>
                <select value={availability} onChange={event => setAvailability(event.target.value)} className="rounded-lg border-2 border-yellow-600 px-4 py-3">
                  <option value="all">All items</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`rounded-full border-2 px-5 py-2 font-black whitespace-nowrap ${
                      filter === category
                        ? 'gold-button border-yellow-700'
                        : 'border-yellow-500 bg-white text-green-900'
                    }`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {filteredItems.map((item, index) => (
                  <div key={item.id} className="overflow-hidden rounded-lg border-2 border-yellow-500 bg-white shadow-md">
                    <div className={`h-32 bg-gradient-to-br ${itemGradients[index % itemGradients.length]}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-black text-green-950">{item.name}</h3>
                          <p className="mt-1 text-sm font-semibold text-green-700">{item.description}</p>
                          {item.pending_price && (
                            <p className="mt-2 text-xs font-black text-yellow-700">Price change pending: ₹{item.pending_price}</p>
                          )}
                        </div>
                        <p className="text-xl font-black text-green-950">₹{item.price}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm font-bold text-green-800">
                        <span>{item.prep_time} min</span>
                        <span>Stock {item.inventory}</span>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={!orderable || !item.available || item.inventory === 0}
                          className="rounded-lg border-2 border-green-800 bg-green-700 px-4 py-2 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="rounded-lg border-2 border-yellow-500 bg-white p-8 text-center font-black text-green-950 md:col-span-2">
                    No menu items match your search.
                  </div>
                )}
              </div>
            </section>

            <aside className="sticky top-24 h-fit rounded-lg border-4 border-yellow-500 bg-white p-5 shadow-lg">
              <h2 className="mb-4 border-b-3 border-yellow-400 pb-3 text-2xl font-black text-green-950">Cart</h2>
              {shopCart.length === 0 ? (
                <p className="py-8 text-center font-bold text-green-800">
                  {orderable ? 'Add items to continue.' : shopStatusText(shop)}
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {shopCart.map(item => (
                      <div key={item.product_id} className="rounded-lg border-2 border-green-200 bg-green-50 p-3">
                        <div className="flex justify-between gap-3">
                          <p className="font-black text-green-950">{item.name}</p>
                          <p className="font-black text-yellow-700">₹{item.price * item.quantity}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded border-2 border-green-700">
                            <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="px-3 py-1 font-black text-green-900">-</button>
                            <span className="px-3 font-black text-green-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="px-3 py-1 font-black text-green-900">+</button>
                          </div>
                          <button onClick={() => updateQuantity(item.product_id, 0)} className="font-black text-red-700">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 rounded-lg bg-yellow-50 p-3 font-bold text-green-900">
                    <div className="flex justify-between"><span>Subtotal</span><span>₹{bill.subtotal}</span></div>
                    <div className="flex justify-between"><span>Tax</span><span>₹{bill.tax}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span>₹{bill.delivery}</span></div>
                    <div className="flex justify-between text-sm text-green-700"><span>Commission</span><span>₹{bill.platformFee}</span></div>
                    <div className="flex justify-between border-t-2 border-yellow-400 pt-2 text-xl font-black"><span>Total</span><span>₹{bill.total}</span></div>
                  </div>

                  <Link
                    to="/cart"
                    className="gold-button mt-4 block w-full rounded-lg border-2 px-4 py-3 text-center font-black"
                  >
                    Go to cart
                  </Link>
                </>
              )}
            </aside>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
