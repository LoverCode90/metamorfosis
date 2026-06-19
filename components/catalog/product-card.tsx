/* eslint-disable @next/next/no-img-element */
"use client"

import { Heart, Plus } from "lucide-react"
import Link from "next/link"
import { formatUSD } from "@/lib/utils/format"
import { squareImageUrl } from "@/lib/utils/square-image"
import type { CatalogCard } from "@/lib/catalog"
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog"
import { cn } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import type { Product } from "@/lib/types"

function toProduct(card: CatalogCard): Product {
  return {
    id: card.squareProductId,
    name: card.nameEn,
    variant: card.categoriesHierarchy,
    image: card.imageUrl ?? "",
    unitPrice: card.minPrice,
    discountPerItem: 0,
    stock: card.totalStock,
    isProfessional: card.isProfessional,
  }
}

export function ProductCard({ product: card }: { product: CatalogCard }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const wishlisted = isWishlisted(card.squareProductId)
  const lowStock = card.totalStock > 0 && card.totalStock <= LOW_STOCK_THRESHOLD
  const outOfStock = card.totalStock === 0

  const badge = card.isProfessional
    ? {
        label: "Professional",
        className: "bg-background text-foreground ring-1 ring-border",
      }
    : null

  const imgSrc = squareImageUrl(card.imageUrl, 600) ?? "/placeholder.svg"

  function handleAdd() {
    if (outOfStock) return
    addToCart(toProduct(card))
  }

  function handleWishlist() {
    toggleWishlist(toProduct(card))
  }

  return (
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
          "absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-colors",
          wishlisted
            ? "bg-foreground text-background"
            : "bg-background/90 text-foreground hover:bg-muted shadow-sm",
        )}
      >
        <Heart
          className="h-4 w-4"
          strokeWidth={1.75}
          fill={wishlisted ? "currentColor" : "none"}
        />
      </button>

      <Link
        href={`/products/${card.squareProductId}`}
        className="border-border bg-muted focus-visible:ring-ring relative aspect-square w-full overflow-hidden rounded-lg border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={`View ${card.nameEn}`}
      >
        {badge && (
          <span
            className={cn(
              "absolute top-2.5 left-2.5 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
              badge.className,
            )}
          >
            {badge.label}
          </span>
        )}
        {lowStock && !outOfStock && (
          <span className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
            Low stock
          </span>
        )}
        <img
          src={imgSrc}
          alt={card.nameEn}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

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
              `From ${formatUSD(card.minPrice)}`
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
  )
}
