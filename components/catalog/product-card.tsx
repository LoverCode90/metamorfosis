/* eslint-disable @next/next/no-img-element */
"use client"

import { Heart, Plus } from "lucide-react"
import Link from "next/link"
import { formatUSD } from "@/lib/utils/format"
import type { CatalogProduct } from "@/lib/catalog"
import { cn } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const hasDiscount = product.discountPerItem > 0
  const finalPrice = product.unitPrice - product.discountPerItem
  const wishlisted = isWishlisted(product.id)

  const badge = product.isNew
    ? { label: "New", className: "bg-foreground text-background" }
    : product.isProfessional
      ? {
          label: "Professional",
          className: "bg-background text-foreground ring-1 ring-border",
        }
      : null

  return (
    <article className="group relative flex flex-col">
      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        aria-label={
          wishlisted
            ? `Remove ${product.name} from wishlist`
            : `Save ${product.name} to wishlist`
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
        href={`/products/${product.id}`}
        className="border-border bg-muted focus-visible:ring-ring relative aspect-square w-full overflow-hidden rounded-lg border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={`View ${product.name}`}
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
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
          {product.brand}
        </p>
        <Link
          href={`/products/${product.id}`}
          className="text-foreground mt-1 text-left text-sm leading-snug font-medium hover:underline"
        >
          {product.name}
        </Link>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {product.variant}
        </p>

        <div className="mt-auto flex flex-col items-stretch gap-2 pt-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-foreground text-sm font-semibold tabular-nums">
              {formatUSD(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground text-xs tabular-nums line-through">
                {formatUSD(product.unitPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => addToCart(product)}
            className="bg-foreground text-background focus-visible:ring-ring inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-md px-3 text-xs font-semibold whitespace-nowrap transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Add to Bag
          </button>
        </div>
      </div>
    </article>
  )
}
