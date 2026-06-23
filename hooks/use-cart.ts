"use client"

import { useEffect, useRef } from "react"
import { useCartStore } from "@/stores/cart"
import { useWishlistStore } from "@/stores/wishlist"
import { useUser } from "@/hooks/use-user"
import type { Product } from "@/lib/types"

/**
 * Module-level sets — track which user IDs have already had their guest cart /
 * wishlist synced into Supabase this browser session. Using module-level
 * variables (not refs) ensures only ONE component instance triggers each sync
 * even when many components call useCart() simultaneously.
 */
const _syncedUsers = new Set<string>()
const _syncedWishlistUsers = new Set<string>()

/**
 * Unified cart + wishlist hook.
 * Guest: in-memory (cart also persisted in localStorage via Zustand persist).
 * Auth: cart merged to Supabase on login; wishlist loaded from Supabase on login.
 * Every mutation syncs to the corresponding API route.
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

  // ── Load wishlist from Supabase exactly once per login session ────────────
  useEffect(() => {
    if (!user || _syncedWishlistUsers.has(user.id)) return
    _syncedWishlistUsers.add(user.id)

    fetch("/api/wishlist")
      .then((r) => r.json())
      .then(({ items }) => {
        if (Array.isArray(items)) wishlist.loadFromDb(items)
      })
      .catch((err) => console.error("[use-cart] wishlist load failed:", err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // ── On logout: clear stores + any legacy localStorage, reset sync guards ──
  const prevUserIdRef = useRef<string | null>(null)
  useEffect(() => {
    const prev = prevUserIdRef.current
    const next = user?.id ?? null
    if (prev !== null && next === null) {
      _syncedUsers.clear()
      _syncedWishlistUsers.clear()
      cart.clearCart()
      wishlist.clear()
      if (typeof window !== "undefined") {
        localStorage.removeItem("metamorfosis-cart")
        localStorage.removeItem("metamorfosis-wishlist")
      }
    }
    prevUserIdRef.current = next
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── addToCart ─────────────────────────────────────────────────────────────
  function addToCart(product: Product, quantity = 1) {
    cart.addToCart(product, quantity)
    if (user && product.variationId) {
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
        fetch("/api/wishlist/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.id,
            variationId: item.variationId,
          }),
        }).catch((err) =>
          console.error("[use-cart] move-to-wishlist add failed:", err),
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

  // ── toggleWishlist ─────────────────────────────────────────────────────────
  function toggleWishlist(product: Product) {
    const wasWishlisted = wishlist.isWishlisted(
      product.variationId ?? product.id,
    )
    wishlist.toggle(product)
    if (user) {
      if (wasWishlisted) {
        fetch("/api/wishlist/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            variationId: product.variationId,
          }),
        }).catch((err) =>
          console.error("[use-cart] wishlist remove failed:", err),
        )
      } else {
        fetch("/api/wishlist/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            variationId: product.variationId,
          }),
        }).catch((err) => console.error("[use-cart] wishlist add failed:", err))
      }
    }
  }

  // ── removeFromWishlist ─────────────────────────────────────────────────────
  function removeFromWishlist(key: string) {
    const item = useWishlistStore
      .getState()
      .items.find((p) => (p.variationId ?? p.id) === key)
    wishlist.remove(key)
    if (user && item) {
      fetch("/api/wishlist/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.id,
          variationId: item.variationId,
        }),
      }).catch((err) =>
        console.error("[use-cart] wishlist remove failed:", err),
      )
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
    toggleWishlist,
    removeFromWishlist,
  }
}
