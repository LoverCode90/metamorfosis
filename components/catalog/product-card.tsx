/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react"
import Link from "next/link"
import { formatUSD } from "@/lib/utils/format"
import { squareImageUrl } from "@/lib/utils/square-image"
import type { CatalogCard } from "@/lib/catalog"
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog"
import { cn } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import type { Product } from "@/lib/types"
import { WishlistLoginModal } from "./wishlist-login-modal"

function toProduct(card: CatalogCard): Product {
  return {
    id: card.squareProductId,
    name: card.nameEn,
    variant: card.categoriesHierarchy,
    image: card.imageUrl ?? "",
    unitPrice: card.minPriceCents,
    discountPerItem: 0,
    stock: card.totalStock,
    isProfessional: card.isProfessional,
    isColorProduct: card.isColorProduct,
    variationId: card.defaultVariationId ?? undefined,
    squareVariationId: card.defaultSquareVariationId ?? undefined,
  }
}

export function ProductCard({ product: card }: { product: CatalogCard }) {
  const { addToCart, toggleWishlist, isWishlisted, isAuthenticated } = useCart()
  const wishlisted = isWishlisted(card.squareProductId)
  const lowStock = card.totalStock > 0 && card.totalStock <= LOW_STOCK_THRESHOLD
  const outOfStock = card.totalStock === 0
  const [showWishlistModal, setShowWishlistModal] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  const badge = card.isProfessional
    ? {
        label: "Professional",
        className: "bg-background text-foreground ring-1 ring-border",
      }
    : null

  const images =
    card.imageUrls.length > 0
      ? card.imageUrls
      : card.imageUrl
        ? [card.imageUrl]
        : []
  const hasMultiple = images.length > 1
  const imgSrc =
    squareImageUrl(images[imgIdx] ?? card.imageUrl, 600) ?? "/placeholder.svg"

  function handleAdd() {
    if (outOfStock) return
    addToCart(toProduct(card))
  }

  function handleWishlist() {
    if (!isAuthenticated) {
      setShowWishlistModal(true)
      return
    }
    toggleWishlist(toProduct(card))
  }

  return (
    <>
      <article className="group relative flex flex-col">
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={
            wishlisted
              ? `Remove ${card.nameEn} from wishlist`
              : `Save ${card.nameEn} to wishlist`
          }
          aria-pressed={wishlisted}
          className={cn(
            "bg-background/90 hover:bg-muted absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors",
            wishlisted ? "text-rose-500" : "text-foreground",
          )}
        >
          <Heart
            className="h-4 w-4"
            strokeWidth={1.75}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>

        <div className="border-border bg-muted group/img relative aspect-square w-full overflow-hidden rounded-lg border">
          <Link
            href={`/products/${card.squareProductId}`}
            className="focus-visible:ring-ring absolute inset-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label={`View ${card.nameEn}`}
          >
            <img
              src={imgSrc}
              alt={card.nameEn}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {badge && (
            <span
              className={cn(
                "pointer-events-none absolute top-2.5 left-2.5 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          )}
          {lowStock && !outOfStock && (
            <span className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
              Low stock
            </span>
          )}

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setImgIdx((i) => (i > 0 ? i - 1 : images.length - 1))
                }}
                aria-label="Previous image"
                className="bg-background/80 absolute top-1/2 left-1.5 z-10 -translate-y-1/2 rounded-full p-1 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover/img:opacity-100"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setImgIdx((i) => (i + 1) % images.length)
                }}
                aria-label="Next image"
                className="bg-background/80 absolute top-1/2 right-1.5 z-10 -translate-y-1/2 rounded-full p-1 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover/img:opacity-100"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover/img:opacity-100">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 w-1 rounded-full transition-colors",
                      i === imgIdx ? "bg-white" : "bg-white/50",
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-3">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {card.categoriesHierarchy.split(" > ")[0]}
          </p>
          <Link
            href={`/products/${card.squareProductId}`}
            className="text-foreground mt-1 text-left text-sm leading-snug font-medium hover:underline"
          >
            {card.nameEn}
          </Link>

          <div className="mt-auto flex flex-col items-stretch gap-2 pt-3 sm:flex-row sm:items-end sm:justify-between">
            <span className="text-foreground text-sm font-semibold tabular-nums">
              {outOfStock ? (
                <span className="text-muted-foreground text-xs">
                  Out of stock
                </span>
              ) : (
                `From ${formatUSD(card.minPriceCents)}`
              )}
            </span>

            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className="bg-foreground text-background focus-visible:ring-ring inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-md px-3 text-xs font-semibold whitespace-nowrap transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              {card.isColorProduct ? "Select" : "Add to Bag"}
            </button>
          </div>
        </div>
      </article>

      <WishlistLoginModal
        open={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
      />
    </>
  )
}
