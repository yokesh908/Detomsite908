export type UserRoleChoice = 'student' | 'shopkeeper' | 'admin'

export interface LocalSession {
  role: UserRoleChoice
  email: string
  name: string
  phone?: string
  campus?: string
  default_delivery_location?: string
  shop_name?: string
  shop_category?: string
}

const SESSION_KEY = 'detomsite-session'

export function getLocalSession(): LocalSession | null {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY)
    if (!rawSession) return null
    return JSON.parse(rawSession) as LocalSession
  } catch {
    return null
  }
}

export function saveLocalSession(session: LocalSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearLocalSession() {
  localStorage.removeItem(SESSION_KEY)
}
