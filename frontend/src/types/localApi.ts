export interface LocalShop {
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

export interface LocalProduct {
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

export interface LocalOrder {
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

export interface LocalPayment {
  id: string
  order_id: string
  amount: number
  method: string
  status: string
  utr_number: string | null
  screenshot_name: string | null
  created_at: string
}

export interface LocalTicket {
  id: string
  ticket_number: string
  name: string
  email: string
  phone_number: string
  category: string
  title: string
  description: string
  status: string
  created_at: string
}

export interface LocalNotification {
  id: string
  title: string
  message: string
  order_id: string | null
  status: string | null
  is_read: number
  created_at: string
}

export interface LocalSummary {
  shops: number
  orderable_shops: number
  products: number
  active_orders: number
  revenue: number
  token_starts_at: number
}

export interface LocalDatabaseStatus {
  connected: boolean
  mode: 'mongo' | 'turso' | 'demo'
  database: string
  persistent: boolean
  message: string
}

function parseShopTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  const [, hourText, minuteText, periodText] = match
  const period = periodText.toUpperCase()
  let hour = Number(hourText) % 12
  if (period === 'PM') hour += 12
  return hour * 60 + Number(minuteText)
}

export function isShopWithinHours(shop: LocalShop, date = new Date()) {
  const open = parseShopTime(shop.opening_time)
  const close = parseShopTime(shop.closing_time)
  if (open === null || close === null) return true
  const now = date.getHours() * 60 + date.getMinutes()
  if (open <= close) return now >= open && now <= close
  return now >= open || now <= close
}

export function canOrderFromShop(shop: LocalShop) {
  return (
    shop.approval_status === 'Approved' &&
    Boolean(shop.present) &&
    shop.status === 'Open' &&
    isShopWithinHours(shop)
  )
}

export function shopStatusText(shop: LocalShop) {
  if (shop.approval_status !== 'Approved') return 'Approval pending'
  if (!shop.present) return 'Not accepting now'
  if (shop.status !== 'Open') return shop.status
  if (!isShopWithinHours(shop)) return 'Shop closed'
  return 'Open now'
}
