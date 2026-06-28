import { formatUSD } from "@/lib/utils/format"
import type { Totals } from "@/lib/types"

interface OrderTotalsProps {
  totals: Totals
}

/** Itemized cost breakdown (subtotal, discount, tax, surcharge) — shipping shown at checkout. */
export function OrderTotals({ totals }: OrderTotalsProps) {
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
