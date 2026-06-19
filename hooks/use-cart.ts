"use client"

import { useEffect, useRef } from "react"
import { useCartStore } from "@/stores/cart"
import { useWishlistStore } from "@/stores/wishlist"
import { useUser } from "@/hooks/use-user"
import type { Product } from "@/lib/types"

/**
 * Unified cart + wishlist hook.
 * Handles Supabase cart sync for authenticated users, guest localStorage for guests.
 * Merge-on-login is triggered once when user transitions from null → authenticated.
 */
export function useCart() {
  const cart = useCartStore()
  const wishlist = useWishlistStore()
  const { user } = useUser()
  const mergedRef = useRef(false)

  // ── Merge guest cart → Supabase on login ───────────────────────────────────
  useEffect(() => {
    if (!user || mergedRef.current) return
    mergedRef.current = true

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

  // ── Reset merge flag on logout ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      mergedRef.current = false
    }
  }, [user])

  // ── addToCart with Supabase side-effect for auth users ─────────────────────
  function addToCart(product: Product, quantity = 1) {
    cart.addToCart(product, quantity)
    if (user && product.variationId) {
      const existing = cart.items.find(
        (i) => i.variationId === product.variationId,
      )
      const newQty = existing
        ? Math.min(existing.quantity + quantity, product.stock)
        : Math.min(quantity, product.stock)
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
    // Cart state
    items: cart.items,
    totals: cart.totals,
    hasProItems: cart.hasProItems,
    hasUnavailableItems: cart.hasUnavailableItems,
    isAuthenticated: !!user,

    // Cart actions
    addToCart,
    increment,
    decrement,
    removeItem,
    moveToWishlist,
    clearCart: cart.clearCart,
    markUnavailable: cart.markUnavailable,
    loadFromDb: cart.loadFromDb,

    // Wishlist
    wishlist: wishlist.items,
    isWishlisted: wishlist.isWishlisted,
    toggleWishlist: wishlist.toggle,
    removeFromWishlist: wishlist.remove,
  }
}
