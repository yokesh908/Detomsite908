import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MainLayout } from '../../components/Layout'
import api from '../../services/api'
import { LocalNotification, LocalOrder, LocalTicket } from '../../types/localApi'
import { getLocalSession } from '../../utils/session'

const deliverySlots: Record<string, string> = {
  Morning: '08:00 AM - 11:00 AM',
  Afternoon: '12:00 PM - 04:00 PM',
  Evening: '05:00 PM - 08:00 PM',
  Night: '08:00 PM - 11:00 PM',
}

export function CustomerDashboard() {
  const session = getLocalSession()
  const [orders, setOrders] = useState<LocalOrder[]>([])
  const [tickets, setTickets] = useState<LocalTicket[]>([])
  const [notifications, setNotifications] = useState<LocalNotification[]>([])

  useEffect(() => {
    const loadOrders = () => {
      Promise.all([
        api.get<LocalOrder[]>('/local/orders'),
        api.get<LocalTicket[]>('/local/tickets'),
        api.get<LocalNotification[]>('/local/notifications'),
      ])
        .then(([ordersResponse, ticketsResponse, notificationsResponse]) => {
          setOrders(ordersResponse.data)
          setTickets(ticketsResponse.data)
          setNotifications(notificationsResponse.data)
        })
        .catch(() => setOrders([]))
    }

    loadOrders()
    const timer = window.setInterval(loadOrders, 5000)
    return () => window.clearInterval(timer)
  }, [])

  const studentOrders = useMemo(() => {
    if (!session?.name) return orders
    const mine = orders.filter(order => order.student_name.toLowerCase() === session.name.toLowerCase())
    return mine.length ? mine : orders
  }, [orders, session?.name])
  const activeOrders = studentOrders.filter(order => order.status !== 'Completed')
  const totalSpent = studentOrders.reduce((sum, order) => sum + order.total, 0)
  const studentTickets = session?.email
    ? tickets.filter(ticket => ticket.email.toLowerCase() === session.email.toLowerCase())
    : tickets

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fff7e6] px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="gold-sheen mb-8 rounded-lg border-4 border-yellow-500 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-black text-green-950">Student Dashboard</h1>
                <p className="mt-2 font-bold text-green-800">{session?.email || 'Local student account'}</p>
              </div>
              <Link to="/shops" className="gold-button rounded-lg border-2 px-5 py-3 font-black">
                Browse restaurants
              </Link>
            </div>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            {[
              ['Total orders', studentOrders.length],
              ['Total spent', `₹${totalSpent}`],
              ['Active orders', activeOrders.length],
              ['Support tickets', studentTickets.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-sm">
                <p className="text-sm font-black text-yellow-700">{label}</p>
                <p className="mt-2 text-3xl font-black text-green-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="mb-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-black text-green-950">Profile</h2>
              <div className="grid gap-2 font-bold text-green-800">
                <p>{session?.name || 'Student'}</p>
                <p>{session?.email || 'No email saved'}</p>
                <p>{session?.phone || 'No phone saved'}</p>
                <p>{session?.campus || 'Campus not saved'}</p>
                <p>{session?.default_delivery_location || 'Delivery location not saved'}</p>
              </div>
            </section>

            <section className="rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-black text-green-950">Notifications</h2>
              <div className="space-y-2">
                {notifications.slice(0, 4).map(notification => (
                  <Link key={notification.id} to={notification.order_id ? `/order-result/${notification.order_id}` : '/customer-dashboard'} className="block rounded-lg bg-yellow-50 p-3">
                    <p className="font-black text-green-950">{notification.title}</p>
                    <p className="text-sm font-bold text-green-800">{notification.message}</p>
                  </Link>
                ))}
                {notifications.length === 0 && <p className="font-bold text-green-800">No notifications yet.</p>}
              </div>
            </section>
          </div>

          <div className="mb-8 grid gap-5 lg:grid-cols-3">
            {activeOrders.map(order => (
              <div key={order.id} className="rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-md">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-black text-yellow-700">Token</p>
                    <p className="text-4xl font-black text-green-950">{order.token}</p>
                  </div>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800">
                    {order.status}
                  </span>
                </div>
                <h2 className="text-xl font-black text-green-950">{order.shop_name}</h2>
                <p className="mt-1 text-sm font-semibold text-green-700">{order.items}</p>
                <div className="mt-4 space-y-1 text-sm font-bold text-green-800">
                  <p>{order.delivery_location}</p>
                  <p>{order.delivery_slot} · {deliverySlots[order.delivery_slot]}</p>
                  <p>₹{order.total}</p>
                </div>
                <Link to={`/order-result/${order.id}`} className="mt-4 inline-flex rounded-lg border-2 border-yellow-500 bg-white px-4 py-2 font-black text-green-900">
                  View result
                </Link>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border-2 border-yellow-500 bg-white shadow-md">
            <div className="border-b-2 border-yellow-400 p-5">
              <h2 className="text-2xl font-black text-green-950">Order history</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-yellow-50">
                  <tr>
                    {['Token', 'Shop', 'Items', 'Slot', 'Amount', 'Status', 'Result'].map(column => (
                      <th key={column} className="px-5 py-3 text-left font-black text-green-950">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentOrders.map(order => (
                    <tr key={order.id} className="border-t border-yellow-100">
                      <td className="px-5 py-4 font-black text-green-950">{order.token}</td>
                      <td className="px-5 py-4 font-bold text-green-800">{order.shop_name}</td>
                      <td className="px-5 py-4 text-green-800">{order.items}</td>
                      <td className="px-5 py-4 text-green-800">{order.delivery_slot}</td>
                      <td className="px-5 py-4 font-black text-yellow-700">₹{order.total}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/order-result/${order.id}`} className="font-black text-yellow-700 underline">
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 rounded-lg border-2 border-yellow-500 bg-white p-5 shadow-md">
            <h2 className="mb-4 text-2xl font-black text-green-950">Support tickets</h2>
            <div className="space-y-3">
              {studentTickets.slice(0, 4).map(ticket => (
                <div key={ticket.id} className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                  <p className="font-black text-green-950">{ticket.ticket_number} · {ticket.title}</p>
                  <p className="text-sm font-bold text-green-800">{ticket.phone_number} · {ticket.status}</p>
                </div>
              ))}
              {studentTickets.length === 0 && <p className="font-bold text-green-800">No support tickets yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
