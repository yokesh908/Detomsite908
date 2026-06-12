import { StoredCartItem } from './cart'

export function getBillBreakdown(items: StoredCartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.05)
  const delivery = items.length ? 30 : 0
  const platformFee = Math.round(subtotal * 0.05)
  const gatewayFee = Math.round(subtotal * 0.02)
  const total = subtotal + tax + delivery
  const vendorReceives = Math.max(0, subtotal - platformFee - gatewayFee)

  return {
    subtotal,
    tax,
    delivery,
    platformFee,
    gatewayFee,
    total,
    vendorReceives,
  }
}
