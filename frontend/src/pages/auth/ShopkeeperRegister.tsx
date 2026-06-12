/*
 * Shopkeeper Registration Page
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MainLayout } from '../../components/Layout'

export function ShopkeeperRegister() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    shopCategory: '',
    campus: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = [
    'Italian', 'Chinese', 'Indian', 'Fast Food', 'Cafe', 'Bakery',
    'Desserts', 'Beverages', 'Vegan', 'Japanese', 'Mexican', 'Continental'
  ]

  const campuses = [
    { id: 1, name: 'Main Campus' },
    { id: 2, name: 'Tech Park Campus' },
    { id: 3, name: 'North Campus' },
    { id: 4, name: 'South Campus' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.shopName || !formData.shopCategory || !formData.campus) {
      setError('All fields are mandatory')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    // TODO: Call registration API
    setTimeout(() => {
      setLoading(false)
      alert('Registration submitted! Awaiting admin approval.')
      navigate('/login')
    }, 1500)
  }

  return (
    <MainLayout>
      <div className="py-12 px-4 bg-gradient-to-br from-yellow-50 to-white min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border-4 border-yellow-400 p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">👨‍🍳</div>
              <h1 className="text-3xl font-bold text-yellow-600 mb-2">Shopkeeper Registration</h1>
              <p className="text-yellow-600 text-sm">Register your restaurant on DETOMSITE</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 rounded-lg text-red-700 font-semibold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="business@restaurant.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="9876543210"
                />
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-2">Shop Name *</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Your restaurant name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-2">Shop Category *</label>
                <select
                  name="shopCategory"
                  value={formData.shopCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Campus */}
              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-2">Campus *</label>
                <select
                  name="campus"
                  value={formData.campus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select campus</option>
                  {campuses.map(campus => (
                    <option key={campus.id} value={campus.name}>{campus.name}</option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-yellow-500 text-green-900 rounded-lg font-bold border-2 border-yellow-400 hover:bg-yellow-400 transition disabled:opacity-50"
              >
                {loading ? '📝 Registering...' : '✅ Register Shop'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-yellow-700">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-yellow-600 hover:text-yellow-800 underline">
                Sign In
              </Link>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <p className="text-sm text-yellow-700 font-semibold mb-2">
                ⏳ Status: Pending Approval
              </p>
              <p className="text-sm text-yellow-600">
                After registration, an admin will review your shop. You'll receive an email once approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
