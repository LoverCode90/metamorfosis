"use client"

import { AlertCircle, Heart, RotateCcw, Trash2, Truck } from "lucide-react"
import { formatUSD, type CartItem } from "@/lib/checkout"
import { QtyStepper } from "../qty-stepper"
import { useCart } from "../cart-context"

const LOW_STOCK_THRESHOLD = 5

export function CartLineItem({ item }: { item: CartItem }) {
  const { increment, decrement, removeItem, moveToWishlist } = useCart()
  const lineTotal = item.unitPrice * item.quantity
  const lowStock = item.stock <= LOW_STOCK_THRESHOLD
  const hasDiscount = item.discountPerItem > 0

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:h-28 sm:w-28">
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
                {item.name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {item.variant}
              </p>
            </div>

            <button
              type="button"
              onClick={() => moveToWishlist(item.id)}
              className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Heart className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>

          {/* Low stock warning */}
          {lowStock && (
            <p className="mt-2.5 flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive">
              <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
              Only {item.stock} left in stock
            </p>
          )}

          {/* Delivery meta */}
          <div className="mt-2.5 space-y-1">
            <p className="flex items-center gap-1.5 text-xs text-emerald-600">
              <Truck className="h-3.5 w-3.5" strokeWidth={1.75} />
              Arrives Dec 18–20
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
              Free returns within 30 days
            </p>
          </div>

          {/* Price + controls */}
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-foreground tabular-nums">
                {formatUSD(lineTotal)}
              </p>
              {hasDiscount && (
                <p className="text-xs text-emerald-600 tabular-nums">
                  -{formatUSD(item.discountPerItem * item.quantity)} pro discount
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <QtyStepper
                value={item.quantity}
                onIncrement={() => increment(item.id)}
                onDecrement={() => decrement(item.id)}
                max={item.stock}
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
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
