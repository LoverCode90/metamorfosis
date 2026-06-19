import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Order, Product, Totals } from "@/lib/types"
import { computeTotals } from "@/lib/utils/totals"
import { createOrder } from "@/lib/utils/order"
import { MOCK_INITIAL_CART } from "@/lib/mock/cart"
import { sendEmail } from "@/lib/email"

interface OrderDetails {
  email: string
  shipName: string
  shipAddress: string
}

interface CartState {
  items: CartItem[]
  order: Order | null
  orderCanceled: boolean
  verified: boolean
  totals: Totals

  // Derived
  hasProItems: boolean

  // Item actions
  addToCart: (product: Product, quantity?: number) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  removeItem: (id: string) => void
  moveToWishlist: (id: string) => CartItem | undefined

  // Order actions
  placeOrder: (details: OrderDetails) => Order
  cancelOrder: () => void
  resetCart: () => void
  setVerified: (value: boolean) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: MOCK_INITIAL_CART,
      order: null,
      orderCanceled: false,
      verified: false,
      totals: computeTotals(MOCK_INITIAL_CART),
      hasProItems: MOCK_INITIAL_CART.some((i) => i.isProfessional),

      addToCart: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)
          const items = existing
            ? state.items.map((i) =>
                i.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
                  : i,
              )
            : [
                ...state.items,
                { ...product, quantity: Math.min(quantity, product.stock) },
              ]
          return {
            items,
            totals: computeTotals(items),
            hasProItems: items.some((i) => i.isProfessional),
          }
        }),

      increment: (id) =>
        set((state) => {
          const items = state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
              : i,
          )
          return { items, totals: computeTotals(items) }
        }),

      decrement: (id) =>
        set((state) => {
          const items = state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i,
          )
          return { items, totals: computeTotals(items) }
        }),

      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((i) => i.id !== id)
          return {
            items,
            totals: computeTotals(items),
            hasProItems: items.some((i) => i.isProfessional),
          }
        }),

      moveToWishlist: (id) => {
        const target = get().items.find((i) => i.id === id)
        if (!target) return undefined
        set((state) => {
          const items = state.items.filter((i) => i.id !== id)
          return {
            items,
            totals: computeTotals(items),
            hasProItems: items.some((i) => i.isProfessional),
          }
        })
        return target
      },

      placeOrder: (details) => {
        const created = createOrder(get().items, details)
        set({ order: created, orderCanceled: false })
        void sendEmail({
          to: details.email,
          template: "order.confirmation",
          data: { orderNumber: created.number, total: created.totals.total },
        })
        return created
      },

      cancelOrder: () =>
        set((state) => {
          if (state.order) {
            void sendEmail({
              to: state.order.email,
              template: "order.canceled",
              data: { orderNumber: state.order.number },
            })
          }
          return { orderCanceled: true }
        }),

      resetCart: () => {
        const items = MOCK_INITIAL_CART
        set({
          items,
          order: null,
          orderCanceled: false,
          verified: false,
          totals: computeTotals(items),
          hasProItems: items.some((i) => i.isProfessional),
        })
      },

      setVerified: (value) => set({ verified: value }),
    }),
    {
      name: "metamorfosis-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
