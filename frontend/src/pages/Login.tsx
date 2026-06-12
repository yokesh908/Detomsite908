import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/Layout'
import { saveSessionToBackend } from '../services/localApi'
import { getLocalSession, saveLocalSession, UserRoleChoice } from '../utils/session'

export function Login() {
  const savedSession = getLocalSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState(savedSession?.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRoleChoice>(savedSession?.role || 'student')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    const session = {
      role,
      email,
      name: savedSession?.name || (role === 'student' ? 'Student' : 'Shopkeeper'),
    }
    saveLocalSession(session)
    void saveSessionToBackend(session)
    setTimeout(() => {
      setLoading(false)
      navigate(role === 'student' ? '/customer-dashboard' : '/shopkeeper-dashboard')
    }, 400)
  }

  return (
    <MainLayout>
      <div className="py-12 px-4 bg-gradient-to-br from-green-50 to-white min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border-4 border-yellow-400 p-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-green-800">Welcome Back</h1>
            <p className="text-center text-green-700 font-semibold mb-8">
              Sign in with your campus email. Your role choice stays saved on this browser.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'shopkeeper'] as UserRoleChoice[]).map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={`rounded-lg border-2 px-4 py-3 font-bold transition ${
                      role === option
                        ? 'border-green-700 bg-green-700 text-white'
                        : 'border-green-700 bg-green-50 text-green-800 hover:bg-green-100'
                    }`}
                  >
                    {option === 'student' ? 'Student' : 'Shopkeeper'}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold text-green-800 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="you@campus.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-green-800 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-yellow-400 text-green-950 rounded-lg font-black border-2 border-yellow-500 hover:bg-yellow-300 transition disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 grid grid-cols-2 gap-3 text-center">
              <Link to="/register/student" className="text-green-700 font-bold hover:underline">
                Student signup
              </Link>
              <Link to="/register/shopkeeper" className="text-green-700 font-bold hover:underline">
                Shop signup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
