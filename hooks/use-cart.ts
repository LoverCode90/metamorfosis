"use client"

import { useEffect, useRef } from "react"
import { useCartStore } from "@/stores/cart"
import { useWishlistStore } from "@/stores/wishlist"
import { useUser } from "@/hooks/use-user"
import type { Product } from "@/lib/types"

/**
 * Module-level set — tracks which user IDs have already had their guest cart
 * merged into Supabase this browser session.
 *
 * Using a module-level variable (not a ref) ensures only ONE component instance
 * triggers the sync even when many components call useCart() simultaneously
 * (e.g. SiteHeader, ProductCard, CartView). A ref is per-instance and would
 * cause each mounted component to fire an independent merge, accumulating qty.
 */
const _syncedUsers = new Set<string>()

/**
 * Unified cart + wishlist hook.
 * Guest: persisted in localStorage via Zustand persist middleware.
 * Auth: merged to Supabase on login, synced on every mutation.
 */
export function useCart() {
  const cart = useCartStore()
  const wishlist = useWishlistStore()
  const { user } = useUser()

  // ── Merge guest cart → Supabase exactly once per login session ────────────
  useEffect(() => {
    if (!user || _syncedUsers.has(user.id)) return
    _syncedUsers.add(user.id)

    const guestItems = cart.items
      .filter((i) => i.variationId)
      .map((i) => ({ variationId: i.variationId, quantity: i.quantity }))

    fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: guestItems }),
    })
      .then((r) => r.json())
      .then(({ items }) => {
        if (Array.isArray(items)) {
          cart.loadFromDb(items)
        }
      })
      .catch((err) => console.error("[use-cart] sync failed:", err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // ── On logout: clear stores + any legacy localStorage, reset sync guard ───
  // useUser() starts with user === null before resolving — the ref ensures we
  // only act on a real truthy→null transition (actual logout / account
  // deletion), not the initial mount. We also proactively delete the legacy
  // persisted keys so a stale guest cart/wishlist can never reappear.
  const prevUserIdRef = useRef<string | null>(null)
  useEffect(() => {
    const prev = prevUserIdRef.current
    const next = user?.id ?? null
    if (prev !== null && next === null) {
      _syncedUsers.clear()
      cart.clearCart()
      wishlist.clear()
      if (typeof window !== "undefined") {
        localStorage.removeItem("metamorfosis-cart")
        localStorage.removeItem("metamorfosis-wishlist")
      }
    }
    prevUserIdRef.current = next
    // cart/wishlist store actions are stable Zustand refs — safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── addToCart ─────────────────────────────────────────────────────────────
  function addToCart(product: Product, quantity = 1) {
    cart.addToCart(product, quantity)
    if (user && product.variationId) {
      // Read the post-update quantity directly from the store (not the stale
      // closure snapshot) to send the correct value to the server.
      const stored = useCartStore
        .getState()
        .items.find((i) => (i.variationId ?? i.id) === product.variationId)
      const newQty = stored?.quantity ?? Math.min(quantity, product.stock)
      fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variationId: product.variationId,
          quantity: newQty,
        }),
      }).catch((err) => console.error("[use-cart] add failed:", err))
    }
  }

  function removeItem(variationId: string) {
    cart.removeItem(variationId)
    if (user) {
      fetch("/api/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variationId }),
      }).catch((err) => console.error("[use-cart] remove failed:", err))
    }
  }

  function moveToWishlist(variationId: string) {
    const item = cart.moveToWishlist(variationId)
    if (item) {
      wishlist.addFromCart(item)
      if (user) {
        fetch("/api/cart/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variationId }),
        }).catch((err) =>
          console.error("[use-cart] move-to-wishlist remove failed:", err),
        )
      }
    }
  }

  function increment(variationId: string) {
    cart.increment(variationId)
    if (user) {
      const updated = useCartStore
        .getState()
        .items.find((i) => (i.variationId ?? i.id) === variationId)
      if (updated) {
        fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variationId, quantity: updated.quantity }),
        }).catch((err) => console.error("[use-cart] increment failed:", err))
      }
    }
  }

  function decrement(variationId: string) {
    cart.decrement(variationId)
    if (user) {
      const updated = useCartStore
        .getState()
        .items.find((i) => (i.variationId ?? i.id) === variationId)
      if (updated) {
        fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variationId, quantity: updated.quantity }),
        }).catch((err) => console.error("[use-cart] decrement failed:", err))
      }
    }
  }

  return {
    items: cart.items,
    totals: cart.totals,
    hasProItems: cart.hasProItems,
    hasUnavailableItems: cart.hasUnavailableItems,
    isAuthenticated: !!user,

    addToCart,
    increment,
    decrement,
    removeItem,
    moveToWishlist,
    clearCart: cart.clearCart,
    markUnavailable: cart.markUnavailable,
    loadFromDb: cart.loadFromDb,

    wishlist: wishlist.items,
    isWishlisted: wishlist.isWishlisted,
    toggleWishlist: wishlist.toggle,
    removeFromWishlist: wishlist.remove,
  }
}
