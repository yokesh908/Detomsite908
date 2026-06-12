/*
 * Student Registration Page
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MainLayout } from '../../components/Layout'

export function StudentRegister() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    campus: '',
    defaultLocation: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.campus || !formData.defaultLocation) {
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
      alert('Registration successful! Please login.')
      navigate('/login')
    }, 1500)
  }

  return (
    <MainLayout>
      <div className="py-12 px-4 bg-gradient-to-br from-green-50 to-white min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border-4 border-yellow-400 p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎓</div>
              <h1 className="text-3xl font-bold text-green-700 mb-2">Student Registration</h1>
              <p className="text-green-600 text-sm">Join DETOMSITE and start ordering</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 rounded-lg text-red-700 font-semibold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="you@campus.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="9876543210"
                />
              </div>

              {/* Campus */}
              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">Campus *</label>
                <select
                  name="campus"
                  value={formData.campus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select your campus</option>
                  {campuses.map(campus => (
                    <option key={campus.id} value={campus.name}>{campus.name}</option>
                  ))}
                </select>
              </div>

              {/* Default Location */}
              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">Default Delivery Location *</label>
                <input
                  type="text"
                  name="defaultLocation"
                  value={formData.defaultLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="E.g., Hostel A Block 201"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold border-2 border-green-700 hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? '📝 Registering...' : '✅ Register'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-green-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-green-700 hover:text-green-800 underline">
                Sign In
              </Link>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-600 rounded-lg">
              <p className="text-sm text-green-700 font-semibold">
                ℹ️ All fields are mandatory. You must complete your profile before placing orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
