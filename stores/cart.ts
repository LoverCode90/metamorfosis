import { create } from "zustand"
import type { CartItem, Product, Totals } from "@/lib/types"
import { computeTotals } from "@/lib/utils/totals"
import { PRO_RESTRICTIONS_ENABLED } from "@/lib/constants"

interface CartState {
  items: CartItem[]
  totals: Totals

  // Derived
  hasProItems: boolean
  hasUnavailableItems: boolean

  // Item actions
  addToCart: (product: Product, quantity?: number) => void
  increment: (variationId: string) => void
  decrement: (variationId: string) => void
  removeItem: (variationId: string) => void
  moveToWishlist: (variationId: string) => CartItem | undefined
  markUnavailable: (variationIds: string[]) => void
  clearCart: () => void

  // Supabase sync (called from use-cart hook after login)
  loadFromDb: (items: CartItem[]) => void
}

function derive(items: CartItem[]) {
  return {
    totals: computeTotals(items),
    hasProItems:
      PRO_RESTRICTIONS_ENABLED &&
      items.some((item) => item.isProfessional && !item.unavailable),
    hasUnavailableItems: items.some((item) => item.unavailable),
  }
}

// In-memory only — NEVER persisted to localStorage. Guests therefore always
// start with an empty cart, and authenticated users are restored from Supabase
// on login (see hooks/use-cart.ts → /api/cart/sync). This also prevents stale
// carts surviving logout or account deletion.
export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  totals: computeTotals([]),
  hasProItems: false,
  hasUnavailableItems: false,

  addToCart: (product, quantity = 1) =>
    set((state) => {
      const key = product.variationId ?? product.id
      const existing = state.items.find(
        (item) => (item.variationId ?? item.id) === key,
      )
      const items: CartItem[] = existing
        ? state.items.map((item) =>
            (item.variationId ?? item.id) === key
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + quantity, item.stock),
                }
              : item,
          )
        : [
            ...state.items,
            {
              ...product,
              variationId: product.variationId ?? product.id,
              squareVariationId: product.squareVariationId ?? "",
              quantity: Math.min(quantity, product.stock),
            },
          ]
      return { items, ...derive(items) }
    }),

  increment: (variationId) =>
    set((state) => {
      const items = state.items.map((item) =>
        (item.variationId ?? item.id) === variationId
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
          : item,
      )
      return { items, ...derive(items) }
    }),

  decrement: (variationId) =>
    set((state) => {
      const items = state.items.map((item) =>
        (item.variationId ?? item.id) === variationId
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item,
      )
      return { items, ...derive(items) }
    }),

  removeItem: (variationId) =>
    set((state) => {
      const items = state.items.filter(
        (item) => (item.variationId ?? item.id) !== variationId,
      )
      return { items, ...derive(items) }
    }),

  moveToWishlist: (variationId) => {
    const target = get().items.find(
      (item) => (item.variationId ?? item.id) === variationId,
    )
    if (!target) return undefined
    set((state) => {
      const items = state.items.filter(
        (item) => (item.variationId ?? item.id) !== variationId,
      )
      return { items, ...derive(items) }
    })
    return target
  },

  markUnavailable: (variationIds) =>
    set((state) => {
      const unavailSet = new Set(variationIds)
      const items = state.items.map((item) =>
        unavailSet.has(item.variationId ?? item.id)
          ? { ...item, unavailable: true }
          : item,
      )
      return { items, ...derive(items) }
    }),

  clearCart: () => set({ items: [], ...derive([]) }),

  loadFromDb: (dbItems) => set({ items: dbItems, ...derive(dbItems) }),
}))
