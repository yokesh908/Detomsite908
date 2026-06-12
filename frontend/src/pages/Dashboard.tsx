/*
 * User Dashboard Page
 */
import { MainLayout } from '../components/Layout'

interface Order {
  id: string
  number: string
  shop: string
  total: number
  status: string
  date: string
}

const mockOrders: Order[] = [
  {
    id: '1',
    number: '#ORD-001',
    shop: 'Pizza Palace',
    total: 450,
    status: 'Delivered',
    date: '2024-06-10',
  },
  {
    id: '2',
    number: '#ORD-002',
    shop: 'Burger King',
    total: 280,
    status: 'Delivered',
    date: '2024-06-09',
  },
  {
    id: '3',
    number: '#ORD-003',
    shop: 'Biryani House',
    total: 520,
    status: 'In Progress',
    date: '2024-06-11',
  },
]

export function Dashboard() {
  const totalSpent = mockOrders.reduce((sum, order) => sum + order.total, 0)

  return (
    <MainLayout>
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">👤 My Dashboard</h1>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{mockOrders.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Total Spent</p>
              <p className="text-3xl font-bold text-orange-600">₹{totalSpent}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Active Orders</p>
              <p className="text-3xl font-bold text-blue-600">1</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Loyalty Points</p>
              <p className="text-3xl font-bold text-green-600">1,250</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold">📦 Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Shop</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map((order, idx) => (
                    <tr key={order.id} className={idx !== mockOrders.length - 1 ? 'border-b border-gray-200' : ''}>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.shop}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{order.total}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
