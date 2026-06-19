"use client"

import { useCartStore } from "@/stores/cart"
import { useWishlistStore } from "@/stores/wishlist"

/**
 * Thin hook that unifies cart + wishlist operations behind a stable API.
 * Components should import from here, not from the stores directly, so
 * the underlying stores can be swapped in Phase 4 (Supabase-backed cart).
 */
export function useCart() {
  const cart = useCartStore()
  const wishlist = useWishlistStore()

  function moveToWishlist(id: string) {
    const item = cart.moveToWishlist(id)
    if (item) wishlist.addFromCart(item)
  }

  return {
    // Cart state
    items: cart.items,
    totals: cart.totals,
    hasProItems: cart.hasProItems,
    order: cart.order,
    orderCanceled: cart.orderCanceled,
    verified: cart.verified,

    // Cart actions
    addToCart: cart.addToCart,
    increment: cart.increment,
    decrement: cart.decrement,
    removeItem: cart.removeItem,
    moveToWishlist,
    placeOrder: cart.placeOrder,
    cancelOrder: cart.cancelOrder,
    resetCart: cart.resetCart,
    setVerified: cart.setVerified,

    // Wishlist (surfaced so cart-adjacent UI can check)
    wishlist: wishlist.items,
    isWishlisted: wishlist.isWishlisted,
    toggleWishlist: wishlist.toggle,
    removeFromWishlist: wishlist.remove,
  }
}
