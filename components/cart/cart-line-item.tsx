/* eslint-disable @next/next/no-img-element */
"use client"

import { AlertCircle, Heart, RotateCcw, Trash2, Truck } from "lucide-react"
import Link from "next/link"
import { formatUSD } from "@/lib/utils/format"
import { RETURN_WINDOW_DAYS } from "@/lib/constants"
import type { CartItem } from "@/lib/types"
import { QtyStepper } from "@/components/shared/qty-stepper"
import { useCart } from "@/hooks/use-cart"
import { LOW_STOCK_THRESHOLD } from "@/lib/constants"

export function CartLineItem({ item }: { item: CartItem }) {
  const { increment, decrement, removeItem, moveToWishlist } = useCart()
  // Cart is keyed by variationId when present; fall back to squareProductId.
  const itemKey = item.variationId ?? item.id
  const lineTotal = item.unitPrice * item.quantity
  const lowStock = item.stock <= LOW_STOCK_THRESHOLD
  const hasDiscount = item.discountPerItem > 0

  return (
    <article className="border-border bg-card rounded-xl border p-3 sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <div className="border-border bg-muted h-20 w-20 shrink-0 overflow-hidden rounded-lg border sm:h-28 sm:w-28">
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <Link
                href={`/products/${item.id}`}
                className="text-foreground hover:text-accent-violet line-clamp-2 text-sm font-semibold transition-colors sm:line-clamp-1"
              >
                {item.name}
              </Link>
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                {item.variant}
              </p>
            </div>

            <button
              type="button"
              onClick={() => moveToWishlist(itemKey)}
              className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-xs font-medium transition-colors sm:gap-1.5"
            >
              <Heart className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>

          {lowStock && (
            <p className="bg-destructive/10 text-destructive mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium sm:mt-2.5 sm:px-2.5 sm:py-1.5">
              <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
              Only {item.stock} left
            </p>
          )}

          <div className="mt-2 space-y-0.5 text-xs sm:mt-2.5 sm:space-y-1">
            <p className="flex items-center gap-1.5 text-emerald-600">
              <Truck className="h-3.5 w-3.5" strokeWidth={1.75} />
              Estimated 2–7 business days
            </p>
            {item.isReturnable !== false && (
              <p className="text-muted-foreground flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                Returns accepted within {RETURN_WINDOW_DAYS} days if eligible
              </p>
            )}
          </div>

          <div className="mt-3 flex items-end justify-between gap-2 sm:mt-4 sm:gap-3">
            <div>
              <p className="text-foreground text-base font-semibold tabular-nums">
                {formatUSD(lineTotal)}
              </p>
              {hasDiscount && (
                <p className="text-xs text-emerald-600 tabular-nums">
                  -{formatUSD(item.discountPerItem * item.quantity)} discount
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <QtyStepper
                value={item.quantity}
                onIncrement={() => increment(itemKey)}
                onDecrement={() => decrement(itemKey)}
                max={item.stock}
              />
              <button
                type="button"
                onClick={() => removeItem(itemKey)}
                aria-label={`Remove ${item.name}`}
                className="border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive flex h-8 w-8 items-center justify-center rounded-md border transition-colors sm:h-9 sm:w-9"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
