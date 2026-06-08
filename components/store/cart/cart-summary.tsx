"use client"

import { useState } from "react"
import { ChevronDown, Tag, Truck } from "lucide-react"
import { formatUSD, type Totals } from "@/lib/checkout"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface CartSummaryProps {
  totals: Totals
  onCheckout: () => void
  onContinueShopping: () => void
  disabled?: boolean
}

export function CartSummary({
  totals,
  onCheckout,
  onContinueShopping,
  disabled,
}: CartSummaryProps) {
  const [promoOpen, setPromoOpen] = useState(false)
  const [promo, setPromo] = useState("")

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Order Summary
        </h2>

        {/* Promo accordion */}
        <div className="mt-5 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setPromoOpen((o) => !o)}
            aria-expanded={promoOpen}
            className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-sm text-foreground"
          >
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              Have a promo code?
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                promoOpen && "rotate-180",
              )}
            />
          </button>
          {promoOpen && (
            <div className="flex gap-2 border-t border-border p-3">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Enter code"
                className="h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                className="h-10 shrink-0 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        <Separator className="my-5" />

        {/* Breakdown */}
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">
              Subtotal ({totals.itemCount} item{totals.itemCount === 1 ? "" : "s"})
            </dt>
            <dd className="font-medium text-foreground tabular-nums">
              {formatUSD(totals.subtotal)}
            </dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Professional discount</dt>
              <dd className="font-medium text-emerald-600 tabular-nums">
                -{formatUSD(totals.discount)}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Truck className="h-4 w-4" strokeWidth={1.75} />
              Shipping
            </dt>
            <dd className="font-medium uppercase tracking-wide text-emerald-600">
              Free
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Estimated tax</dt>
            <dd className="font-medium text-foreground tabular-nums">
              {formatUSD(totals.tax)}
            </dd>
          </div>
        </dl>

        <Separator className="my-5" />

        <div className="flex items-end justify-between">
          <span className="text-sm font-medium text-foreground">Total</span>
          <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {formatUSD(totals.total)}
          </span>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          disabled={disabled}
          className={cn(
            "mt-5 h-12 w-full rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled && "cursor-not-allowed opacity-40 hover:opacity-40",
          )}
        >
          Continue to checkout
        </button>
        <button
          type="button"
          onClick={onContinueShopping}
          className="mt-3 h-12 w-full rounded-md border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Continue Shopping
        </button>
      </div>
    </aside>
  )
}
