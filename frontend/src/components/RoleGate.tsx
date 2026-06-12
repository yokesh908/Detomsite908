import { FormEvent, ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveSessionToBackend } from '../services/localApi'
import { getLocalSession, saveLocalSession, UserRoleChoice } from '../utils/session'

interface RoleGateProps {
  children: ReactNode
}

const foodCards = [
  { name: 'Pizza Palace', type: 'Pizzas', color: 'from-orange-500 to-red-600' },
  { name: 'Biryani House', type: 'Meals', color: 'from-amber-500 to-orange-700' },
  { name: 'Burger Bay', type: 'Fast food', color: 'from-yellow-400 to-orange-500' },
  { name: 'Tea Point', type: 'Cafe', color: 'from-emerald-600 to-green-900' },
]

export function RoleGate({ children }: RoleGateProps) {
  const navigate = useNavigate()
  const [hasSession, setHasSession] = useState(false)
  const [role, setRole] = useState<UserRoleChoice>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [campus, setCampus] = useState('Main Campus')
  const [defaultDeliveryLocation, setDefaultDeliveryLocation] = useState('Hostel A Block 201')
  const [shopName, setShopName] = useState('')
  const [shopCategory, setShopCategory] = useState('Fast Food')

  useEffect(() => {
    setHasSession(Boolean(getLocalSession()))
  }, [])

  const handleStart = (event: FormEvent) => {
    event.preventDefault()
    const session = {
      role,
      name: name.trim() || (role === 'admin' ? 'Admin' : role === 'student' ? 'Student' : 'Shopkeeper'),
      email: email.trim(),
      phone: phone.trim(),
      campus: role === 'student' ? campus.trim() : undefined,
      default_delivery_location: role === 'student' ? defaultDeliveryLocation.trim() : undefined,
      shop_name: role === 'shopkeeper' ? shopName.trim() : undefined,
      shop_category: role === 'shopkeeper' ? shopCategory.trim() : undefined,
    }
    saveLocalSession(session)
    void saveSessionToBackend(session)
    setHasSession(true)
    navigate(role === 'admin' ? '/admin-dashboard' : role === 'student' ? '/shops' : '/shopkeeper-dashboard')
  }

  if (hasSession) return <>{children}</>

  return (
    <main className="min-h-screen bg-[#fff7e6] px-4 py-6 text-green-950">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-lg border-4 border-yellow-500 bg-green-950 p-6 text-white shadow-2xl md:p-8">
          <div className="absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-yellow-400/25 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-120px] h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="relative">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg border-2 border-yellow-300 bg-yellow-400 text-2xl font-black text-green-950">
              D
            </div>
            <h1 className="text-5xl font-black leading-none tracking-tight text-yellow-200 md:text-7xl">
              DETOMSITE
            </h1>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {foodCards.map(card => (
                <div key={card.name} className="overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-lg backdrop-blur">
                  <div className={`h-28 bg-gradient-to-br ${card.color}`} />
                  <div className="p-4">
                    <p className="font-black text-white">{card.name}</p>
                    <p className="text-sm font-bold text-yellow-100">{card.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="gold-sheen rounded-lg border-4 border-yellow-500 p-6 shadow-xl">
          <h2 className="mb-6 text-3xl font-black text-green-950">Continue as</h2>

          <form onSubmit={handleStart} className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {(['student', 'shopkeeper', 'admin'] as UserRoleChoice[]).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`rounded-lg border-3 p-4 text-left font-black transition ${
                    role === option
                      ? 'gold-button border-yellow-700'
                      : 'border-yellow-500 bg-white/85 text-green-900 hover:bg-yellow-50'
                  }`}
                >
                  {option === 'admin' ? 'Admin' : option === 'student' ? 'Student' : 'Shopkeeper'}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-green-900">Name</label>
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                className="w-full rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 text-green-950 outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder={role === 'admin' ? 'Admin name' : role === 'student' ? 'Student name' : 'Shopkeeper name'}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-green-900">Email</label>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="w-full rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 text-green-950 outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="you@campus.com"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-green-900">Phone</label>
                <input
                  value={phone}
                  onChange={event => setPhone(event.target.value)}
                  className="w-full rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 text-green-950 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Phone number"
                  required={role !== 'admin'}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-green-900">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="w-full rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 text-green-950 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            {role === 'admin' ? (
              <div className="rounded-lg border-2 border-yellow-500 bg-white/80 p-4">
                <p className="text-sm font-black text-green-950">Admin control opens approvals, payments, shop status, and database status.</p>
              </div>
            ) : role === 'student' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-black text-green-900">Campus</label>
                  <input
                    value={campus}
                    onChange={event => setCampus(event.target.value)}
                    className="w-full rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 text-green-950 outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Campus"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-black text-green-900">Default Delivery</label>
                  <input
                    value={defaultDeliveryLocation}
                    onChange={event => setDefaultDeliveryLocation(event.target.value)}
                    className="w-full rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 text-green-950 outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Default delivery location"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-black text-green-900">Shop Name</label>
                  <input
                    value={shopName}
                    onChange={event => setShopName(event.target.value)}
                    className="w-full rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 text-green-950 outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Shop name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-black text-green-900">Shop Category</label>
                  <input
                    value={shopCategory}
                    onChange={event => setShopCategory(event.target.value)}
                    className="w-full rounded-lg border-2 border-yellow-600 bg-white px-4 py-3 text-green-950 outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Shop category"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="gold-button w-full rounded-lg border-3 px-4 py-4 text-lg font-black"
            >
              Enter DETOMSITE
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
