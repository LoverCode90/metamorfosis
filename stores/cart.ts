import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Product, Totals } from "@/lib/types"
import { computeTotals } from "@/lib/utils/totals"

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
    hasProItems: items.some((i) => i.isProfessional && !i.unavailable),
    hasUnavailableItems: items.some((i) => i.unavailable),
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totals: computeTotals([]),
      hasProItems: false,
      hasUnavailableItems: false,

      addToCart: (product, quantity = 1) =>
        set((state) => {
          const key = product.variationId ?? product.id
          const existing = state.items.find(
            (i) => (i.variationId ?? i.id) === key,
          )
          const items: CartItem[] = existing
            ? state.items.map((i) =>
                (i.variationId ?? i.id) === key
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + quantity, i.stock),
                    }
                  : i,
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
          const items = state.items.map((i) =>
            (i.variationId ?? i.id) === variationId
              ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
              : i,
          )
          return { items, ...derive(items) }
        }),

      decrement: (variationId) =>
        set((state) => {
          const items = state.items.map((i) =>
            (i.variationId ?? i.id) === variationId
              ? { ...i, quantity: Math.max(i.quantity - 1, 1) }
              : i,
          )
          return { items, ...derive(items) }
        }),

      removeItem: (variationId) =>
        set((state) => {
          const items = state.items.filter(
            (i) => (i.variationId ?? i.id) !== variationId,
          )
          return { items, ...derive(items) }
        }),

      moveToWishlist: (variationId) => {
        const target = get().items.find(
          (i) => (i.variationId ?? i.id) === variationId,
        )
        if (!target) return undefined
        set((state) => {
          const items = state.items.filter(
            (i) => (i.variationId ?? i.id) !== variationId,
          )
          return { items, ...derive(items) }
        })
        return target
      },

      markUnavailable: (variationIds) =>
        set((state) => {
          const set_ = new Set(variationIds)
          const items = state.items.map((i) =>
            set_.has(i.variationId ?? i.id) ? { ...i, unavailable: true } : i,
          )
          return { items, ...derive(items) }
        }),

      clearCart: () => set({ items: [], ...derive([]) }),

      loadFromDb: (dbItems) => set({ items: dbItems, ...derive(dbItems) }),
    }),
    {
      name: "metamorfosis-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
