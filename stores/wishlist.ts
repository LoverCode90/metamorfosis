import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/lib/types"

interface WishlistState {
  items: Product[]
  toggle: (product: Product) => void
  remove: (id: string) => void
  isWishlisted: (id: string) => boolean
  addFromCart: (item: Product) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) =>
        set((state) => ({
          items: state.items.some((p) => p.id === product.id)
            ? state.items.filter((p) => p.id !== product.id)
            : [...state.items, product],
        })),

      remove: (id) =>
        set((state) => ({ items: state.items.filter((p) => p.id !== id) })),

      isWishlisted: (id) => get().items.some((p) => p.id === id),

      addFromCart: (item) =>
        set((state) => ({
          items: state.items.some((p) => p.id === item.id)
            ? state.items
            : [...state.items, item],
        })),
    }),
    { name: "metamorfosis-wishlist" },
  ),
)
