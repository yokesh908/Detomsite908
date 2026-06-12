import { LocalProduct, LocalShop } from '../types/localApi'

export interface StoredCartItem {
  product_id: string
  shop_id: string
  shop_name: string
  name: string
  price: number
  quantity: number
  category: string
}

const CART_KEY = 'detomsite-cart'

export function getCart(): StoredCartItem[] {
  try {
    const rawCart = localStorage.getItem(CART_KEY)
    if (!rawCart) return []
    return JSON.parse(rawCart) as StoredCartItem[]
  } catch {
    return []
  }
}

export function saveCart(items: StoredCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('detomsite-cart-updated'))
}

export function clearCart() {
  saveCart([])
}

export function addProductToCart(product: LocalProduct, shop: LocalShop) {
  const current = getCart()
  const sameShopItems = current.filter(item => item.shop_id === shop.id)
  const existing = sameShopItems.find(item => item.product_id === product.id)

  const nextItems = existing
    ? sameShopItems.map(item => (
      item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
    ))
    : [
      ...sameShopItems,
      {
        product_id: product.id,
        shop_id: shop.id,
        shop_name: shop.name,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
      },
    ]

  saveCart(nextItems)
  return nextItems
}

export function updateCartQuantity(productId: string, quantity: number) {
  const current = getCart()
  const nextItems = quantity <= 0
    ? current.filter(item => item.product_id !== productId)
    : current.map(item => item.product_id === productId ? { ...item, quantity } : item)
  saveCart(nextItems)
  return nextItems
}
