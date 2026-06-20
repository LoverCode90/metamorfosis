"use client"

import { useState } from "react"
import { ChevronDown, Tag, Truck } from "lucide-react"
import { formatUSD } from "@/lib/utils/format"
import type { Totals } from "@/lib/types"
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
      <div className="border-border bg-card rounded-xl border p-4 sm:p-6">
        <h2 className="text-foreground text-lg font-semibold tracking-tight">
          Order Summary
        </h2>

        <div className="border-border mt-4 rounded-lg border sm:mt-5">
          <button
            type="button"
            onClick={() => setPromoOpen((o) => !o)}
            aria-expanded={promoOpen}
            className="text-foreground flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm sm:px-3.5 sm:py-3"
          >
            <span className="flex items-center gap-2">
              <Tag
                className="text-muted-foreground h-4 w-4"
                strokeWidth={1.75}
              />
              Have a promo code?
            </span>
            <ChevronDown
              className={cn(
                "text-muted-foreground h-4 w-4 transition-transform",
                promoOpen && "rotate-180",
              )}
            />
          </button>
          {promoOpen && (
            <div className="border-border flex gap-2 border-t p-2.5 sm:p-3">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Enter code"
                className="border-border bg-background text-foreground focus:border-foreground placeholder:text-muted-foreground h-9 min-w-0 flex-1 rounded-md border px-3 text-sm transition-colors outline-none sm:h-10"
              />
              <button
                type="button"
                className="bg-foreground text-background h-9 shrink-0 rounded-md px-3 text-sm font-medium transition-opacity hover:opacity-90 sm:h-10 sm:px-4"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        <Separator className="my-4 sm:my-5" />

        <dl className="space-y-2.5 text-sm sm:space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">
              Subtotal ({totals.itemCount} item
              {totals.itemCount === 1 ? "" : "s"})
            </dt>
            <dd className="text-foreground font-medium tabular-nums">
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
            <dt className="text-muted-foreground flex items-center gap-1.5">
              <Truck className="h-4 w-4" strokeWidth={1.75} />
              Shipping
            </dt>
            <dd className="font-medium tracking-wide text-emerald-600 uppercase">
              Free
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Estimated tax</dt>
            <dd className="text-foreground font-medium tabular-nums">
              {formatUSD(totals.tax)}
            </dd>
          </div>
        </dl>

        <Separator className="my-4 sm:my-5" />

        <div className="flex items-end justify-between">
          <span className="text-foreground text-sm font-medium">Total</span>
          <span className="text-foreground text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
            {formatUSD(totals.total)}
          </span>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          disabled={disabled}
          className={cn(
            "bg-accent-violet focus-visible:ring-ring mt-4 h-11 w-full rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:mt-5 sm:h-12",
            disabled && "cursor-not-allowed opacity-40 hover:opacity-40",
          )}
        >
          Continue to checkout
        </button>
        <button
          type="button"
          onClick={onContinueShopping}
          className="border-border text-foreground hover:bg-muted focus-visible:ring-ring mt-2.5 h-11 w-full rounded-md border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:mt-3 sm:h-12"
        >
          Continue Shopping
        </button>
      </div>
    </aside>
  )
}
