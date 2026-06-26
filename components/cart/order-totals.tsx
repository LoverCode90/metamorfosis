import { Truck } from "lucide-react"

import { formatUSD } from "@/lib/utils/format"
import type { Totals } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OrderTotalsProps {
  totals: Totals
  qualifiesForFreeShipping: boolean
}

/** Itemized cost breakdown (subtotal, discount, shipping, tax, surcharge). */
export function OrderTotals({
  totals,
  qualifiesForFreeShipping,
}: OrderTotalsProps) {
  const shippingClass = cn(
    "font-medium",
    qualifiesForFreeShipping
      ? "tracking-wide text-emerald-600 uppercase"
      : "text-foreground tabular-nums",
  )

  return (
    <dl className="space-y-2.5 text-sm sm:space-y-3">
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">
          Subtotal ({totals.itemCount} item{totals.itemCount === 1 ? "" : "s"})
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
        <dd className={shippingClass}>
          {qualifiesForFreeShipping ? "Free" : "Calculated at checkout"}
        </dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">Estimated tax</dt>
        <dd className="text-foreground font-medium tabular-nums">
          {formatUSD(totals.tax)}
        </dd>
      </div>
      {totals.surcharge > 0 && (
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Card processing fee (2.6%)</dt>
          <dd className="text-foreground font-medium tabular-nums">
            {formatUSD(totals.surcharge)}
          </dd>
        </div>
      )}
    </dl>
  )
}
