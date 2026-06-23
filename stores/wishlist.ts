import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/lib/types"

/** Wishlist identity key — a specific variation when known, else the product. */
function wKey(p: Pick<Product, "id" | "variationId">): string {
  return p.variationId ?? p.id
}

interface WishlistState {
  items: Product[]
  toggle: (product: Product) => void
  remove: (key: string) => void
  /** `key` is a variationId when available, otherwise the product id. */
  isWishlisted: (key: string) => boolean
  addFromCart: (item: Product) => void
  clear: () => void
}

// Persisted to localStorage so guests preserve wishlist across reloads.
// On logout, useCart() will clear this store and the localStorage key.
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) =>
        set((state) => ({
          items: state.items.some((p) => wKey(p) === wKey(product))
            ? state.items.filter((p) => wKey(p) !== wKey(product))
            : [...state.items, product],
        })),

      remove: (key) =>
        set((state) => ({ items: state.items.filter((p) => wKey(p) !== key) })),

      isWishlisted: (key) => get().items.some((p) => wKey(p) === key),

      addFromCart: (item) =>
        set((state) => ({
          items: state.items.some((p) => wKey(p) === wKey(item))
            ? state.items
            : [...state.items, item],
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "metamorfosis-wishlist" },
  ),
)
