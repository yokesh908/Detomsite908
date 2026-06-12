/*
 * Layout component wrapper with Navigation - Green & Gold Theme
 */
import React, { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import api from "../services/api"
import { LocalNotification } from "../types/localApi"
import { getCart } from "../utils/cart"
import { clearLocalSession, getLocalSession, LocalSession } from "../utils/session"

const SEEN_COMPLETED_NOTIFICATIONS = 'detomsite-seen-completed-notifications'

function getSeenCompletedNotifications() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_COMPLETED_NOTIFICATIONS) || '[]') as string[])
  } catch {
    return new Set<string>()
  }
}

function rememberCompletedNotification(id: string) {
  const seen = getSeenCompletedNotifications()
  seen.add(id)
  localStorage.setItem(SEEN_COMPLETED_NOTIFICATIONS, JSON.stringify([...seen]))
}

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export const MainLayout: React.FC<LayoutProps> = ({
  children,
  className = "",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [session] = useState<LocalSession | null>(() => getLocalSession())
  const [cartCount, setCartCount] = useState(() => getCart().reduce((sum, item) => sum + item.quantity, 0))
  const [notifications, setNotifications] = useState<LocalNotification[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [completionToast, setCompletionToast] = useState<LocalNotification | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/shops', label: 'Shops' },
    {
      path: session?.role === 'admin'
        ? '/admin-dashboard'
        : session?.role === 'shopkeeper'
          ? '/shopkeeper-dashboard'
          : '/customer-dashboard',
      label: 'Dashboard',
    },
    { path: '/cart', label: `Cart${cartCount ? ` (${cartCount})` : ''}` },
    { path: '/support', label: 'Support' },
    { path: '/login', label: 'Login' },
  ]

  useEffect(() => {
    const syncCart = () => setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0))
    window.addEventListener('detomsite-cart-updated', syncCart)
    return () => window.removeEventListener('detomsite-cart-updated', syncCart)
  }, [])

  useEffect(() => {
    const loadNotifications = () => {
      api.get<LocalNotification[]>('/local/notifications')
        .then(response => {
          const nextNotifications = response.data
          setNotifications(nextNotifications)
          const latestCompleted = nextNotifications.find(notification => notification.status === 'Completed')
          if (latestCompleted && !getSeenCompletedNotifications().has(latestCompleted.id)) {
            setCompletionToast(current => current?.id === latestCompleted.id ? current : latestCompleted)
          }
        })
        .catch(() => setNotifications([]))
    }
    loadNotifications()
    const timer = window.setInterval(loadNotifications, 5000)
    return () => window.clearInterval(timer)
  }, [])

  const handleChangeRole = () => {
    clearLocalSession()
    window.location.href = '/'
  }

  const closeCompletionToast = () => {
    if (completionToast) {
      rememberCompletedNotification(completionToast.id)
    }
    setCompletionToast(null)
  }

  return (
    <div className={`min-h-screen bg-[#fffaf0] ${className}`}>
      {/* Navigation */}
      <nav className="gold-sheen sticky top-0 z-50 border-b-4 border-yellow-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-black tracking-wide text-green-900 hover:text-green-700 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-yellow-600 bg-green-900 text-base text-yellow-200">
              D
            </span>
            <span className="gold-text">DETOMSITE</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-semibold transition border-2 ${
                  isActive(item.path)
                    ? 'gold-button border-yellow-700'
                    : 'bg-white/80 text-green-800 border-yellow-500 hover:bg-yellow-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="px-4 py-2 rounded-lg font-semibold transition border-2 bg-white/80 text-green-800 border-yellow-500 hover:bg-yellow-50"
              >
                Notifications{notifications.length ? ` (${notifications.length})` : ''}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border-2 border-yellow-500 bg-white p-3 shadow-xl">
                  <h3 className="mb-2 font-black text-green-950">Order notifications</h3>
                  <div className="max-h-80 space-y-2 overflow-y-auto">
                    {notifications.map(notification => (
                      <Link
                        key={notification.id}
                        to={notification.order_id ? `/order-result/${notification.order_id}` : '/customer-dashboard'}
                        onClick={() => setNotificationsOpen(false)}
                        className="block rounded-lg border border-yellow-200 bg-yellow-50 p-3"
                      >
                        <p className="font-black text-green-950">{notification.title}</p>
                        <p className="text-sm font-bold text-green-800">{notification.message}</p>
                      </Link>
                    ))}
                    {notifications.length === 0 && (
                      <p className="rounded-lg bg-yellow-50 p-3 text-sm font-bold text-green-800">No notifications yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {session && (
              <div className="ml-2 flex items-center gap-2 rounded-lg border-2 border-yellow-500 bg-white/75 px-3 py-2 text-sm font-bold text-green-800">
                <span>{session.role === 'admin' ? 'Admin' : session.role === 'student' ? 'Student' : 'Shopkeeper'}</span>
                <span className="max-w-[150px] truncate">{session.email}</span>
                <button
                  type="button"
                  onClick={handleChangeRole}
                  className="text-green-700 underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-green-700 text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-yellow-50 border-t-4 border-yellow-500 p-4 flex flex-col gap-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg font-semibold transition block border-2 ${
                  isActive(item.path)
                    ? 'gold-button border-yellow-700'
                    : 'bg-white text-green-800 border-yellow-500 hover:bg-yellow-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {session && (
              <button
                type="button"
                onClick={handleChangeRole}
                className="px-4 py-2 rounded-lg font-semibold transition block border-2 text-green-800 border-yellow-500 bg-white text-left"
              >
                Change role · {session.email}
              </button>
            )}
          </div>
        )}
      </nav>

      {location.pathname !== '/' && (
        <div className="border-b border-yellow-200 bg-white/80">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-yellow-500 bg-white px-3 py-2 font-black text-green-900 hover:bg-yellow-50"
            >
              <span aria-hidden="true">←</span>
              Back
            </button>
          </div>
        </div>
      )}

      {completionToast && (
        <div className="fixed right-4 top-24 z-[60] w-[min(360px,calc(100vw-2rem))] rounded-lg border-2 border-green-800 bg-white p-4 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-700">Notification</p>
          <h3 className="mt-1 text-xl font-black text-green-950">{completionToast.title}</h3>
          <p className="mt-2 font-bold text-green-800">{completionToast.message}</p>
          <div className="mt-4 flex gap-2">
            <Link
              to={completionToast.order_id ? `/order-result/${completionToast.order_id}` : '/customer-dashboard'}
              onClick={closeCompletionToast}
              className="gold-button rounded-lg border-2 px-4 py-2 font-black"
            >
              View result
            </Link>
            <button
              type="button"
              onClick={closeCompletionToast}
              className="rounded-lg border-2 border-yellow-500 bg-white px-4 py-2 font-black text-green-900"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-green-950 text-white border-t-4 border-yellow-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-yellow-300">DETOMSITE</h3>
              <p className="text-green-100 text-sm">
                Enterprise Campus Food Ordering Platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-yellow-400">Quick Links</h4>
              <ul className="space-y-2 text-sm text-green-100">
                <li><a href="#" className="hover:text-yellow-400 transition">Shops</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Orders</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Account</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-yellow-400">Company</h4>
              <ul className="space-y-2 text-sm text-green-100">
                <li><a href="#" className="hover:text-yellow-400 transition">About</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Contact</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-yellow-400">Legal</h4>
              <ul className="space-y-2 text-sm text-green-100">
                <li><a href="#" className="hover:text-yellow-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-yellow-500 pt-8">
            <p className="text-center text-green-100 text-sm">
              © 2024 DETOMSITE. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
