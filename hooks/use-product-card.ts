"use client"

import { useState } from "react"

import { useCart } from "@/hooks/use-cart"
import { cardToProduct } from "@/lib/catalog/card-to-product"
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog"
import type { CatalogCard } from "@/lib/catalog"

/**
 * Catalog card behavior: stock flags, the image list, wishlist toggle (with a
 * login prompt for guests), and add-to-cart. Variation selection happens on the
 * detail page when the product has options.
 * @param card - The catalog card to represent.
 */
export function useProductCard(card: CatalogCard) {
  const { addToCart, toggleWishlist, isWishlisted, isAuthenticated } = useCart()
  const [showWishlistModal, setShowWishlistModal] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)

  // Wishlist identity is per-variation; the card represents its default.
  const wishlistKey = card.defaultVariationId ?? card.squareProductId
  const wishlisted = isWishlisted(wishlistKey)
  const lowStock = card.totalStock > 0 && card.totalStock <= LOW_STOCK_THRESHOLD
  const outOfStock = card.totalStock === 0
  // Multiple variations can't be added directly — pick one on the detail page.
  const hasOptions = card.variationCount > 1

  const images =
    card.imageUrls.length > 0
      ? card.imageUrls
      : card.imageUrl
        ? [card.imageUrl]
        : []

  function handleAdd() {
    if (outOfStock) return
    addToCart(cardToProduct(card))
  }

  function handleCartClick() {
    if (outOfStock) return
    if (hasOptions) {
      setShowQuickView(true)
    } else {
      handleAdd()
    }
  }

  function handleWishlist() {
    if (!isAuthenticated) {
      setShowWishlistModal(true)
      return
    }
    toggleWishlist(cardToProduct(card))
  }

  return {
    wishlisted,
    lowStock,
    outOfStock,
    hasOptions,
    images,
    showWishlistModal,
    setShowWishlistModal,
    showQuickView,
    setShowQuickView,
    handleAdd,
    handleCartClick,
    handleWishlist,
  }
}
