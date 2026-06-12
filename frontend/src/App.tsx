import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { Shops } from './pages/Shops'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { ShopDetail } from './pages/shop/ShopDetail'
import { CustomerDashboard } from './pages/customer/CustomerDashboard'
import { ShopkeeperDashboard } from './pages/shopkeeper/ShopkeeperDashboard'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { StudentRegister } from './pages/auth/StudentRegister'
import { ShopkeeperRegister } from './pages/auth/ShopkeeperRegister'
import { RoleGate } from './components/RoleGate'
import { CartPage } from './pages/CartPage'
import { PaymentPage } from './pages/PaymentPage'
import { OrderResultPage } from './pages/OrderResultPage'
import { SupportPage } from './pages/SupportPage'

function App() {
  return (
    <Router>
      <RoleGate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/shop/:shopId" element={<ShopDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/order-result/:orderId" element={<OrderResultPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/register/shopkeeper" element={<ShopkeeperRegister />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/shopkeeper-dashboard" element={<ShopkeeperDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </RoleGate>
    </Router>
  )
}

export default App
