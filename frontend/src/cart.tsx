import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem } from './types'

export type AddResult = 'added' | 'updated' | 'already'

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  // Sets the (product, size) line to item.quantity. Returns 'already' if the cart line
  // already holds exactly that quantity (so re-adding the same amount is a no-op).
  addItem: (item: CartItem) => AddResult
  quantityOf: (product_id: string, size: string) => number
  removeItem: (product_id: string, size: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'campus-customs-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function quantityOf(product_id: string, size: string): number {
    return items.find((i) => i.product_id === product_id && i.size === size)?.quantity ?? 0
  }

  function addItem(item: CartItem): AddResult {
    const existing = items.find((i) => i.product_id === item.product_id && i.size === item.size)
    if (existing && existing.quantity === item.quantity) {
      return 'already' // same item, same quantity — nothing to add
    }
    setItems((prev) => {
      const match = prev.find((i) => i.product_id === item.product_id && i.size === item.size)
      if (!match) return [...prev, item]
      return prev.map((i) => (i === match ? { ...i, quantity: item.quantity } : i))
    })
    return existing ? 'updated' : 'added'
  }

  function removeItem(product_id: string, size: string) {
    setItems((prev) => prev.filter((i) => !(i.product_id === product_id && i.size === size)))
  }

  const count = items.reduce((n, i) => n + i.quantity, 0)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, quantityOf, removeItem, clear: () => setItems([]) }}
    >
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
