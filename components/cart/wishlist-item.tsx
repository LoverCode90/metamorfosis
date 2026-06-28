/* eslint-disable @next/next/no-img-element */
"use client"

import { memo } from "react"
import Link from "next/link"
import { LayoutGrid, List, ShoppingBag, Trash2 } from "lucide-react"
import { formatUSD } from "@/lib/utils/format"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AddToCartButton } from "@/components/catalog/add-to-cart-button"

export type WishItem = Product & {
  category?: string
  brand?: string
  isProfessional?: boolean
}

/** Wishlist grid card (memoized — rendered in a grid). */
export const WishlistCard = memo(function WishlistCard({
  item,
  onRemove,
  onAdd,
}: {
  item: WishItem
  onRemove: () => void
  onAdd: () => void
}) {
  const finalPrice = item.unitPrice - item.discountPerItem
  const hasDiscount = item.discountPerItem > 0
  const outOfStock = item.stock <= 0
  const href = `/products/${item.id}`

  return (
    <article className="group relative flex flex-col">
      <div className="border-border bg-muted relative aspect-square w-full overflow-hidden rounded-xl border">
        {hasDiscount && (
          <span className="bg-foreground text-background absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
            Save {formatUSD(item.discountPerItem)}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remove ${item.name} from wishlist`}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <Link
          href={href}
          aria-label={item.name}
          className="block h-full w-full"
        >
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <AddToCartButton
          outOfStock={outOfStock}
          onClick={onAdd}
          className="absolute right-3 bottom-3 z-10 translate-y-0 opacity-100 transition-all duration-200 lg:translate-y-1 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
        />
      </div>

      <Link href={href} className="mt-3 flex flex-col gap-0.5">
        <span className="text-foreground line-clamp-2 text-sm leading-snug font-medium">
          {item.name}
        </span>
        <span className="text-muted-foreground text-sm">
          {outOfStock ? "Out of stock" : formatUSD(finalPrice)}
        </span>
      </Link>
    </article>
  )
})

/** Wishlist list row (memoized — rendered in a list). */
export const WishlistRow = memo(function WishlistRow({
  item,
  onRemove,
  onAdd,
}: {
  item: WishItem
  onRemove: () => void
  onAdd: () => void
}) {
  const finalPrice = item.unitPrice - item.discountPerItem
  const hasDiscount = item.discountPerItem > 0
  const href = `/products/${item.id}`

  return (
    <li className="flex items-center gap-4 p-4">
      <Link
        href={href}
        className="border-border bg-muted h-16 w-16 shrink-0 overflow-hidden rounded-md border"
        aria-label={item.name}
        tabIndex={-1}
      >
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-0">
          <Link
            href={href}
            className="text-foreground truncate text-sm font-medium hover:underline hover:underline-offset-2"
          >
            {item.name}
          </Link>
          {item.variant && (
            <>
              <span className="text-muted-foreground mx-1.5 text-xs">·</span>
              <span className="text-muted-foreground shrink-0 text-sm">
                {item.variant}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-foreground text-sm font-semibold tabular-nums">
          {formatUSD(finalPrice)}
        </span>
        {hasDiscount && (
          <span className="text-muted-foreground hidden text-xs tabular-nums line-through sm:inline">
            {formatUSD(item.unitPrice)}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onAdd()
        }}
        className="bg-foreground text-background inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-opacity hover:opacity-90"
      >
        <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
        <span className="hidden sm:inline">Add to Cart</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${item.name}`}
        className="border-border text-muted-foreground hover:border-destructive hover:text-destructive flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </li>
  )
})

export function WishlistViewToggle({
  active,
  onClick,
  view,
}: {
  active: boolean
  onClick: () => void
  view: "grid" | "list"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={view === "grid" ? "Grid view" : "List view"}
      aria-pressed={active}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {view === "grid" ? (
        <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <List className="h-4 w-4" strokeWidth={1.75} />
      )}
    </button>
  )
}
