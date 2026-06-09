"use client"

import { Plus } from "lucide-react"
import { formatUSD } from "@/lib/checkout"
import type { CatalogProduct } from "@/lib/catalog"
import { cn } from "@/lib/utils"
import { useCart } from "../cart-context"

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { addToCart, openProduct } = useCart()
  const hasDiscount = product.discountPerItem > 0
  const finalPrice = product.unitPrice - product.discountPerItem

  // "New" takes visual priority over "Professional" when both apply.
  const badge = product.isNew
    ? { label: "New", className: "bg-foreground text-background" }
    : product.isProfessional
      ? { label: "Professional", className: "bg-background text-foreground ring-1 ring-border" }
      : null

  return (
    <article className="group flex flex-col">
      {/* Image */}
      <button
        type="button"
        onClick={() => openProduct(product.id)}
        className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View ${product.name}`}
      >
        {badge && (
          <span
            className={cn(
              "absolute left-2.5 top-2.5 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
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
      </button>

      {/* Meta */}
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <button
          type="button"
          onClick={() => openProduct(product.id)}
          className="mt-1 text-left text-sm font-medium leading-snug text-foreground hover:underline"
        >
          {product.name}
        </button>
        <p className="mt-0.5 text-xs text-muted-foreground">{product.variant}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {formatUSD(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {formatUSD(product.unitPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => addToCart(product)}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-foreground px-3 text-xs font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Add to Bag
          </button>
        </div>
      </div>
    </article>
  )
}
