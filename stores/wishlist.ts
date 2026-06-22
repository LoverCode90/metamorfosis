import { create } from "zustand"
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

// In-memory only — NEVER persisted to localStorage. Guests always start with an
// empty wishlist; clearing on logout/account deletion prevents a stale badge.
export const useWishlistStore = create<WishlistState>()((set, get) => ({
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
}))
