import { FormEvent, useEffect, useState } from 'react'
import { MainLayout } from '../../components/Layout'
import api from '../../services/api'

type Panel = 'details' | 'hours' | 'menu' | 'availability'

interface LocalShop {
  id: string
  name: string
  category: string
  description: string
  rating: number
  opening_time: string
  closing_time: string
  present: number
  status: string
  approval_status: string
  shopkeeper_name: string
  phone: string
  orders_today: number
  revenue_today: number
  current_token: number
}

interface LocalProduct {
  id: string
  shop_id: string
  name: string
  description: string
  price: number
  pending_price: number | null
  category: string
  inventory: number
  prep_time: number
  available: number
}

interface LocalOrder {
  id: string
  token: number
  student_name: string
  student_phone: string
  shop_id: string
  shop_name: string
  items: string
  total: number
  delivery_location: string
  delivery_slot: string
  status: string
  created_at: string
}

interface ProductForm {
  name: string
  description: string
  price: string
  category: string
  inventory: string
  prep_time: string
}

const emptyProduct: ProductForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  inventory: '10',
  prep_time: '10',
}

export function ShopkeeperDashboard() {
  const [shops, setShops] = useState<LocalShop[]>([])
  const [products, setProducts] = useState<LocalProduct[]>([])
  const [orders, setOrders] = useState<LocalOrder[]>([])
  const [activePanel, setActivePanel] = useState<Panel>('details')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [shopForm, setShopForm] = useState({
    name: '',
    category: '',
    description: '',
    opening_time: '',
    closing_time: '',
    status: 'Open',
    shopkeeper_name: '',
    phone: '',
  })
  const [productForms, setProductForms] = useState<Record<string, ProductForm>>({})
  const [newProduct, setNewProduct] = useState<ProductForm>(emptyProduct)

  const shop = shops.find(item => item.id === '1') || shops[0]
  const shopProducts = shop ? products.filter(product => product.shop_id === shop.id) : []
  const shopOrders = shop ? orders.filter(order => order.shop_id === shop.id) : []
  const pendingOrders = shopOrders.filter(order => order.status === 'Pending Acceptance')
  const activeOrders = shopOrders.filter(order => ['Confirmed', 'Preparing', 'Ready'].includes(order.status))
  const completedOrders = shopOrders.filter(order => order.status === 'Completed')
  const pendingPriceProducts = shopProducts.filter(product => product.pending_price)
  const shopRevenue = shopOrders.reduce((sum, order) => sum + order.total, 0)
  const topSellingProducts = shopProducts
    .map(product => ({
      name: product.name,
      count: shopOrders.filter(order => order.items.includes(product.name)).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [shopsResponse, productsResponse, ordersResponse] = await Promise.all([
        api.get<LocalShop[]>('/local/shops'),
        api.get<LocalProduct[]>('/local/products'),
        api.get<LocalOrder[]>('/local/orders'),
      ])
      const nextShops = shopsResponse.data
      const nextProducts = productsResponse.data
      const selectedShop = nextShops.find(item => item.id === '1') || nextShops[0]

      setShops(nextShops)
      setProducts(nextProducts)
      setOrders(ordersResponse.data)

      if (selectedShop) {
        setShopForm({
          name: selectedShop.name,
          category: selectedShop.category,
          description: selectedShop.description,
          opening_time: selectedShop.opening_time,
          closing_time: selectedShop.closing_time,
          status: selectedShop.status,
          shopkeeper_name: selectedShop.shopkeeper_name,
          phone: selectedShop.phone,
        })
      }

      setProductForms(Object.fromEntries(nextProducts.map(product => [
        product.id,
        {
          name: product.name,
          description: product.description,
          price: String(product.price),
          category: product.category,
          inventory: String(product.inventory),
          prep_time: String(product.prep_time),
        },
      ])))
      setMessage('')
    } catch {
      setMessage('Backend is not reachable. Start the local API on port 8001.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  const updateShopState = (updatedShop: LocalShop) => {
    setShops(current => current.map(item => item.id === updatedShop.id ? updatedShop : item))
  }

  const saveShop = async (event: FormEvent) => {
    event.preventDefault()
    if (!shop) return
    const response = await api.patch<LocalShop>(`/local/shops/${shop.id}`, shopForm)
    updateShopState(response.data)
    setMessage('Shop details saved.')
  }

  const togglePresent = async (present: boolean) => {
    if (!shop) return
    const response = await api.patch<LocalShop>(`/local/shops/${shop.id}`, { present })
    updateShopState(response.data)
    setMessage(`Present toggle is ${present ? 'ON' : 'OFF'}.`)
  }

  const saveProduct = async (productId: string) => {
    const form = productForms[productId]
    const response = await api.patch<LocalProduct>(`/local/products/${productId}`, {
      ...form,
      price: Number(form.price),
      inventory: Number(form.inventory),
      prep_time: Number(form.prep_time),
    })
    setProducts(current => current.map(product => product.id === productId ? response.data : product))
    setMessage('Menu item saved.')
  }

  const toggleProduct = async (productId: string, available: boolean) => {
    const response = await api.patch<LocalProduct>(`/local/products/${productId}`, { available })
    setProducts(current => current.map(product => product.id === productId ? response.data : product))
    setMessage(`Product availability ${available ? 'enabled' : 'disabled'}.`)
  }

  const addProduct = async (event: FormEvent) => {
    event.preventDefault()
    if (!shop) return
    const response = await api.post<LocalProduct>('/local/products', {
      shop_id: shop.id,
      name: newProduct.name,
      description: newProduct.description,
      price: Number(newProduct.price),
      category: newProduct.category,
      inventory: Number(newProduct.inventory),
      prep_time: Number(newProduct.prep_time),
      available: true,
    })
    setProducts(current => [...current, response.data])
    setProductForms(current => ({
      ...current,
      [response.data.id]: {
        name: response.data.name,
        description: response.data.description,
        price: String(response.data.price),
        category: response.data.category,
        inventory: String(response.data.inventory),
        prep_time: String(response.data.prep_time),
      },
    }))
    setNewProduct(emptyProduct)
    setMessage('New menu item added.')
  }

  const setOrderStatus = async (orderId: string, status: string) => {
    const response = await api.patch<LocalOrder>(`/local/orders/${orderId}/status`, { status })
    setOrders(current => current.map(order => order.id === orderId ? response.data : order))
    setMessage(`Order moved to ${status}.`)
  }

  const updateProductForm = (productId: string, field: keyof ProductForm, value: string) => {
    setProductForms(current => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value,
      },
    }))
  }

  const panelButtonClass = (panel: Panel) => (
    `p-4 rounded-lg border-3 transition font-black ${
      activePanel === panel
        ? 'gold-button border-yellow-700'
        : 'bg-white/85 border-yellow-500 text-green-800 hover:bg-yellow-50'
    }`
  )

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen px-4 py-12 text-center text-xl font-black text-green-900">
          Loading shop dashboard...
        </div>
      </MainLayout>
    )
  }

  if (!shop) {
    return (
      <MainLayout>
        <div className="min-h-screen px-4 py-12 text-center text-xl font-black text-green-900">
          No shop found in the local database.
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fffaf0] px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="gold-sheen mb-8 rounded-lg border-4 border-yellow-500 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-yellow-700">
                  Shopkeeper Workspace
                </p>
                <h1 className="text-4xl font-black text-green-950 mb-2">{shop.name}</h1>
                <p className="text-green-800 font-semibold">
                  {shop.approval_status} · {shop.opening_time} - {shop.closing_time} · Status {shop.status}
                </p>
              </div>
              <label className="flex items-center gap-3 px-4 py-3 bg-white/80 border-2 border-yellow-600 rounded-lg font-black text-green-900">
                Present
                <input
                  type="checkbox"
                  checked={Boolean(shop.present)}
                  onChange={event => void togglePresent(event.target.checked)}
                  className="h-5 w-5"
                />
                {shop.present ? 'ON' : 'OFF'}
              </label>
            </div>
            {message && (
              <div className="mt-4 rounded-lg border-2 border-yellow-500 bg-white/85 px-4 py-3 text-sm font-bold text-green-900">
                {message}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {[
              ['Revenue Today', `₹${shop.revenue_today}`],
              ['Orders Today', shop.orders_today],
              ['Pending', pendingOrders.length],
              ['Active', activeOrders.length],
              ['Completed', completedOrders.length],
              ['Current Token', shop.current_token],
            ].map(([label, value]) => (
              <div key={label} className="gold-sheen rounded-lg border-4 border-yellow-500 p-5">
                <p className="text-yellow-700 text-sm font-black mb-2">{label}</p>
                <p className="text-3xl font-black text-green-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-md">
              <h2 className="mb-3 text-2xl font-black text-green-950">Sales analytics</h2>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm font-black text-yellow-700">All orders revenue</p>
                  <p className="mt-1 text-2xl font-black text-green-950">₹{shopRevenue}</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm font-black text-yellow-700">Commission</p>
                  <p className="mt-1 text-2xl font-black text-green-950">₹{Math.round(shopRevenue * 0.05)}</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm font-black text-yellow-700">Gateway fee</p>
                  <p className="mt-1 text-2xl font-black text-green-950">₹{Math.round(shopRevenue * 0.02)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-md">
              <h2 className="mb-3 text-2xl font-black text-green-950">Top products</h2>
              <div className="space-y-2">
                {topSellingProducts.map(product => (
                  <div key={product.name} className="flex justify-between rounded-lg bg-green-50 p-3 font-black text-green-900">
                    <span>{product.name}</span>
                    <span>{product.count} orders</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-lg border-4 border-green-700 bg-white p-6">
              <h2 className="text-2xl font-black text-green-900 mb-4 pb-3 border-b-3 border-yellow-400">
                Pending Acceptance
              </h2>
              <div className="space-y-4">
                {pendingOrders.map(order => (
                  <div key={order.id} className="p-4 bg-green-50 border-3 border-green-600 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-green-900">Token {order.token}</span>
                      <span className="text-sm bg-yellow-400 text-green-950 px-2 py-1 rounded font-black">
                        {order.delivery_slot}
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mb-1 font-semibold">{order.items}</p>
                    <p className="text-sm text-green-700 mb-3 font-semibold">
                      {order.student_name} · {order.student_phone} · {order.delivery_location}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => void setOrderStatus(order.id, 'Confirmed')}
                        className="px-3 py-2 bg-green-700 text-white rounded-lg font-black border-2 border-green-800"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => void setOrderStatus(order.id, 'Cancelled')}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-black border-2 border-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingOrders.length === 0 && (
                  <p className="rounded-lg bg-green-50 p-4 font-bold text-green-800">No pending orders.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border-4 border-yellow-500 bg-white p-6">
              <h2 className="text-2xl font-black text-yellow-700 mb-4 pb-3 border-b-3 border-yellow-400">
                Active Orders
              </h2>
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <div key={order.id} className="p-4 bg-yellow-50 border-3 border-yellow-400 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-yellow-800">Token {order.token}</span>
                      <span className="text-sm bg-green-700 text-white px-2 py-1 rounded font-black">{order.status}</span>
                    </div>
                    <p className="text-sm text-yellow-800 mb-3 font-semibold">{order.items}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => void setOrderStatus(order.id, 'Preparing')} className="px-2 py-2 bg-green-700 text-white rounded-lg font-black border-2 border-green-800">
                        Preparing
                      </button>
                      <button onClick={() => void setOrderStatus(order.id, 'Ready')} className="px-2 py-2 gold-button rounded-lg font-black border-2">
                        Ready
                      </button>
                      <button onClick={() => void setOrderStatus(order.id, 'Completed')} className="px-2 py-2 bg-green-100 text-green-800 rounded-lg font-black border-2 border-green-700">
                        Completed
                      </button>
                    </div>
                  </div>
                ))}
                {activeOrders.length === 0 && (
                  <p className="rounded-lg bg-yellow-50 p-4 font-bold text-yellow-800">No active orders.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-6">
            <div className="gold-sheen rounded-lg border-4 border-yellow-500 p-6">
              <h2 className="text-2xl font-black text-green-950 mb-4 pb-3 border-b-3 border-yellow-500">
                Shop Configuration
              </h2>
              <div className="grid gap-3">
                <button onClick={() => setActivePanel('details')} className={panelButtonClass('details')}>Edit Shop Details</button>
                <button onClick={() => setActivePanel('hours')} className={panelButtonClass('hours')}>Set Hours</button>
                <button onClick={() => setActivePanel('menu')} className={panelButtonClass('menu')}>Manage Menu Items</button>
                <button onClick={() => setActivePanel('availability')} className={panelButtonClass('availability')}>Product Availability</button>
              </div>

              <div className="mt-6 rounded-lg border-2 border-yellow-500 bg-white/85 p-4">
                <h3 className="mb-3 text-lg font-black text-yellow-700">Pending Price Approval</h3>
                <div className="space-y-3">
                  {pendingPriceProducts.map(product => (
                    <div key={product.id} className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-3">
                      <p className="font-black text-yellow-800">{product.name}</p>
                      <p className="text-sm text-yellow-800">
                        Old price ₹{product.price} remains active until admin approves ₹{product.pending_price}.
                      </p>
                    </div>
                  ))}
                  {pendingPriceProducts.length === 0 && (
                    <p className="text-sm font-bold text-green-800">No pending price requests.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border-4 border-green-700 bg-white p-6">
              {activePanel === 'details' && (
                <form onSubmit={saveShop} className="space-y-4">
                  <h2 className="text-2xl font-black text-green-950">Edit Shop Details</h2>
                  <input value={shopForm.name} onChange={event => setShopForm({ ...shopForm, name: event.target.value })} className="w-full rounded-lg border-2 border-green-700 px-4 py-3" placeholder="Shop name" />
                  <input value={shopForm.category} onChange={event => setShopForm({ ...shopForm, category: event.target.value })} className="w-full rounded-lg border-2 border-green-700 px-4 py-3" placeholder="Category" />
                  <textarea value={shopForm.description} onChange={event => setShopForm({ ...shopForm, description: event.target.value })} className="min-h-28 w-full rounded-lg border-2 border-green-700 px-4 py-3" placeholder="Description" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input value={shopForm.shopkeeper_name} onChange={event => setShopForm({ ...shopForm, shopkeeper_name: event.target.value })} className="w-full rounded-lg border-2 border-green-700 px-4 py-3" placeholder="Shopkeeper name" />
                    <input value={shopForm.phone} onChange={event => setShopForm({ ...shopForm, phone: event.target.value })} className="w-full rounded-lg border-2 border-green-700 px-4 py-3" placeholder="Phone number" />
                  </div>
                  <button className="gold-button rounded-lg border-2 px-5 py-3 font-black">Save Shop Details</button>
                </form>
              )}

              {activePanel === 'hours' && (
                <form onSubmit={saveShop} className="space-y-4">
                  <h2 className="text-2xl font-black text-green-950">Set Hours And Status</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input value={shopForm.opening_time} onChange={event => setShopForm({ ...shopForm, opening_time: event.target.value })} className="w-full rounded-lg border-2 border-green-700 px-4 py-3" placeholder="Opening time" />
                    <input value={shopForm.closing_time} onChange={event => setShopForm({ ...shopForm, closing_time: event.target.value })} className="w-full rounded-lg border-2 border-green-700 px-4 py-3" placeholder="Closing time" />
                  </div>
                  <select value={shopForm.status} onChange={event => setShopForm({ ...shopForm, status: event.target.value })} className="w-full rounded-lg border-2 border-green-700 px-4 py-3">
                    {['Open', 'Busy', 'Closed', 'Maintenance'].map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button className="gold-button rounded-lg border-2 px-5 py-3 font-black">Save Hours</button>
                </form>
              )}

              {activePanel === 'menu' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-green-950">Manage Menu Items</h2>
                  <form onSubmit={addProduct} className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4">
                    <h3 className="mb-3 font-black text-yellow-800">Add New Item</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input value={newProduct.name} onChange={event => setNewProduct({ ...newProduct, name: event.target.value })} className="rounded-lg border-2 border-yellow-500 px-3 py-2" placeholder="Item name" required />
                      <input value={newProduct.category} onChange={event => setNewProduct({ ...newProduct, category: event.target.value })} className="rounded-lg border-2 border-yellow-500 px-3 py-2" placeholder="Category" required />
                      <input value={newProduct.price} onChange={event => setNewProduct({ ...newProduct, price: event.target.value })} className="rounded-lg border-2 border-yellow-500 px-3 py-2" placeholder="Price" type="number" required />
                      <input value={newProduct.inventory} onChange={event => setNewProduct({ ...newProduct, inventory: event.target.value })} className="rounded-lg border-2 border-yellow-500 px-3 py-2" placeholder="Inventory" type="number" required />
                      <input value={newProduct.prep_time} onChange={event => setNewProduct({ ...newProduct, prep_time: event.target.value })} className="rounded-lg border-2 border-yellow-500 px-3 py-2" placeholder="Prep minutes" type="number" required />
                      <input value={newProduct.description} onChange={event => setNewProduct({ ...newProduct, description: event.target.value })} className="rounded-lg border-2 border-yellow-500 px-3 py-2" placeholder="Description" />
                    </div>
                    <button className="gold-button mt-3 rounded-lg border-2 px-4 py-2 font-black">Add Item</button>
                  </form>

                  {shopProducts.map(product => {
                    const form = productForms[product.id]
                    if (!form) return null
                    return (
                      <div key={product.id} className="rounded-lg border-2 border-green-700 bg-green-50 p-4">
                        <div className="grid md:grid-cols-3 gap-3">
                          <input value={form.name} onChange={event => updateProductForm(product.id, 'name', event.target.value)} className="rounded-lg border-2 border-green-600 px-3 py-2" />
                          <input value={form.category} onChange={event => updateProductForm(product.id, 'category', event.target.value)} className="rounded-lg border-2 border-green-600 px-3 py-2" />
                          <input value={form.price} onChange={event => updateProductForm(product.id, 'price', event.target.value)} className="rounded-lg border-2 border-green-600 px-3 py-2" type="number" />
                          <input value={form.inventory} onChange={event => updateProductForm(product.id, 'inventory', event.target.value)} className="rounded-lg border-2 border-green-600 px-3 py-2" type="number" />
                          <input value={form.prep_time} onChange={event => updateProductForm(product.id, 'prep_time', event.target.value)} className="rounded-lg border-2 border-green-600 px-3 py-2" type="number" />
                          <input value={form.description} onChange={event => updateProductForm(product.id, 'description', event.target.value)} className="rounded-lg border-2 border-green-600 px-3 py-2" />
                        </div>
                        <button onClick={() => void saveProduct(product.id)} className="mt-3 rounded-lg border-2 border-green-800 bg-green-700 px-4 py-2 font-black text-white">
                          Save Item
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {activePanel === 'availability' && (
                <div>
                  <h2 className="mb-4 text-2xl font-black text-green-950">Product Availability</h2>
                  <div className="space-y-3">
                    {shopProducts.map(product => (
                      <div key={product.id} className="flex flex-col gap-3 rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-black text-yellow-900">{product.name}</p>
                          <p className="text-sm font-semibold text-yellow-800">₹{product.price} · Inventory {product.inventory} · {product.prep_time} min</p>
                        </div>
                        <label className="flex items-center gap-3 font-black text-green-900">
                          Available
                          <input
                            type="checkbox"
                            checked={Boolean(product.available)}
                            onChange={event => void toggleProduct(product.id, event.target.checked)}
                            className="h-5 w-5"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
