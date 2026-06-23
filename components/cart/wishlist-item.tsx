/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { LayoutGrid, List, ShoppingBag, Trash2 } from "lucide-react"
import { formatUSD } from "@/lib/utils/format"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

export type WishItem = Product & {
  category?: string
  brand?: string
  isProfessional?: boolean
}

export function WishlistCard({
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
  const lowStock = item.stock <= 10
  const href = `/products/${item.id}`

  return (
    <article className="group flex flex-col">
      <div className="border-border bg-muted relative aspect-square w-full overflow-hidden rounded-lg border">
        {hasDiscount && (
          <span className="bg-foreground text-background absolute top-2.5 left-2.5 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase">
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
          className="bg-background/90 text-foreground hover:bg-destructive hover:text-background absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <Link href={href} aria-label={item.name} tabIndex={-1}>
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col pt-2">
        {item.brand && (
          <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
            {item.brand}
          </p>
        )}
        <Link
          href={href}
          className="text-foreground mt-0.5 text-xs leading-snug font-medium hover:underline hover:underline-offset-2"
        >
          {item.name}
        </Link>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-foreground text-xs font-semibold tabular-nums">
            {formatUSD(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-muted-foreground text-[10px] tabular-nums line-through">
              {formatUSD(item.unitPrice)}
            </span>
          )}
        </div>
        {lowStock && (
          <p className="text-foreground mt-0.5 text-[10px] font-medium">
            Only {item.stock} left
          </p>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAdd()
          }}
          className="bg-foreground text-background mt-2 inline-flex h-8 items-center justify-center gap-1 rounded-md px-2 text-[11px] font-semibold transition-opacity hover:opacity-90"
        >
          <ShoppingBag className="h-3 w-3" strokeWidth={2} />
          Add to Cart
        </button>
      </div>
    </article>
  )
}

export function WishlistRow({
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
        <Link
          href={href}
          className="text-foreground truncate text-sm font-medium hover:underline hover:underline-offset-2"
        >
          {item.name}
        </Link>
        {item.variant && (
          <p className="text-muted-foreground flex gap-1 truncate text-xs">
            {item.variant.split(" > ").map((cat, idx, arr) => (
              <span key={idx} className="inline-flex items-center gap-1">
                <Link
                  href={`/products?category=${encodeURIComponent(cat.trim())}`}
                  className="hover:text-foreground hover:underline"
                >
                  {cat.trim()}
                </Link>
                {idx < arr.length - 1 && <span>&gt;</span>}
              </span>
            ))}
          </p>
        )}
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
}

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
