"use client"

import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import {
  LOW_STOCK_THRESHOLD,
  type CatalogProduct,
  type CatalogVariation,
} from "@/lib/catalog"
import { useCart } from "@/hooks/use-cart"

export interface ProductPurchase {
  qty: number
  setQty: Dispatch<SetStateAction<number>>
  selectedVariationId: string
  setSelectedVariationId: Dispatch<SetStateAction<string>>
  selectedVariation: CatalogVariation | undefined
  stock: number
  lowStock: boolean
  outOfStock: boolean
  priceCents: number
  wishlisted: boolean
  galleryImages: string[]
  colorVariations: CatalogVariation[]
  sizeVariations: CatalogVariation[]
  pdfUrl: string | null
  handleAdd: () => void
  handleWishlist: () => void
}

/**
 * Owns all selection/quantity/wishlist state and derived values for a product
 * detail page. Kept in a single hook so the gallery (parent) and the buy panel
 * share one source of truth for the selected variation.
 */
export function useProductPurchase(product: CatalogProduct): ProductPurchase {
  const { addToCart, toggleWishlist, isWishlisted } = useCart()

  const hardcodedPdfUrl = useMemo(() => {
    const lowerName = product.nameEn.toLowerCase()
    if (lowerName.includes("earthia")) return "earthia-color.pdf"
    if (lowerName.includes("uhd")) return "nutrapel-uhd-cp.pdf"
    if (lowerName.includes("rbl")) return "rbl-gama.pdf"
    if (lowerName.includes("color tech zero")) return "color-tech-zero.pdf"
    if (lowerName.includes("color tech")) return "color-tech-gama.pdf"
    return null
  }, [product.nameEn])

  const pdfUrl = product.colorChartPdfUrl || hardcodedPdfUrl

  const colorVariations = product.variations.filter((v) => v.hexColor)
  const sizeVariations = product.variations.filter((v) => !v.hexColor)

  const [qty, setQty] = useState(1)
  const [selectedVariationId, setSelectedVariationId] = useState(
    product.variations[0]?.id ?? "",
  )
  const selectedVariation: CatalogVariation | undefined =
    product.variations.find((v) => v.id === selectedVariationId) ??
    product.variations[0]

  const stock = selectedVariation?.inventoryCount ?? 0
  const lowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD
  const outOfStock = stock === 0
  const priceCents = selectedVariation?.priceCents ?? product.minPriceCents
  // Wishlist heart reflects the SELECTED variation, not the parent product.
  const wishlisted = isWishlisted(
    selectedVariation?.id ?? product.squareProductId,
  )

  // Build gallery: variation image first (if unique), then parent images
  const galleryImages = useMemo(() => {
    const varImg = selectedVariation?.imageUrl ?? null
    const parentImgs =
      product.imageUrls.length > 0
        ? product.imageUrls
        : product.imageUrl
          ? [product.imageUrl]
          : []
    if (varImg) {
      const rest = parentImgs.filter((u) => u !== varImg)
      return [varImg, ...rest]
    }
    return parentImgs
  }, [selectedVariation, product.imageUrls, product.imageUrl])

  const rawImageUrl = selectedVariation?.imageUrl ?? product.imageUrl ?? null

  function handleAdd() {
    addToCart(
      {
        id: product.squareProductId,
        name: product.nameEn,
        variant:
          selectedVariation?.shadeNumber ??
          selectedVariation?.sizeLabel ??
          selectedVariation?.nameEn ??
          "",
        image: rawImageUrl ?? "",
        unitPrice: priceCents,
        discountPerItem: 0,
        stock,
        isProfessional: product.isProfessional,
        isColorProduct: product.isColorProduct,
        isReturnable: product.isReturnable,
        variationId: selectedVariation?.id,
        squareVariationId: selectedVariation?.squareVariationId,
      },
      qty,
    )
  }

  function handleWishlist() {
    toggleWishlist({
      id: product.squareProductId,
      name: product.nameEn,
      variant: selectedVariation?.nameEn ?? "",
      image: rawImageUrl ?? "",
      unitPrice: priceCents,
      discountPerItem: 0,
      stock,
      isProfessional: product.isProfessional,
      isColorProduct: product.isColorProduct,
      variationId: selectedVariation?.id,
      squareVariationId: selectedVariation?.squareVariationId,
    })
  }

  return {
    qty,
    setQty,
    selectedVariationId,
    setSelectedVariationId,
    selectedVariation,
    stock,
    lowStock,
    outOfStock,
    priceCents,
    wishlisted,
    galleryImages,
    colorVariations,
    sizeVariations,
    pdfUrl,
    handleAdd,
    handleWishlist,
  }
}
