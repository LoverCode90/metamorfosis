"use client"

import { memo } from "react"
import { Check } from "lucide-react"

import type { LiveShippingRate } from "@/lib/checkout/types"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface ShippingRateOptionProps {
  rate: LiveShippingRate
  selected: boolean
  freeShipping: boolean
  onSelect: (rate: LiveShippingRate) => void
}

/** Selectable live-rate row (memoized — rendered in a list). */
export const ShippingRateOption = memo(function ShippingRateOption({
  rate,
  selected,
  freeShipping,
  onSelect,
}: ShippingRateOptionProps) {
  const estimatedDays = rate.estimated_days
  const etaLabel =
    estimatedDays != null
      ? `${estimatedDays} business day${estimatedDays === 1 ? "" : "s"}`
      : "Delivery estimate unavailable"

  const rowClass = cn(
    "flex w-full items-center justify-between rounded-lg border px-4 py-4 text-left transition-colors",
    selected
      ? "border-foreground bg-foreground/5"
      : "border-border hover:border-foreground/40",
  )
  const radioClass = cn(
    "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
    selected ? "border-foreground bg-foreground" : "border-border",
  )
  const isFree = freeShipping || rate.amount_cents === 0
  const priceClass = cn(
    "text-sm font-semibold tabular-nums",
    isFree ? "text-green-500" : "text-foreground",
  )

  return (
    <button type="button" onClick={() => onSelect(rate)} className={rowClass}>
      <div className="flex items-center gap-3">
        <span className={radioClass}>
          {selected && (
            <Check className="text-background h-2.5 w-2.5" strokeWidth={3} />
          )}
        </span>
        <div>
          <p className="text-foreground text-sm font-medium">
            {rate.carrier} · {rate.service_name}
          </p>
          <p className="text-muted-foreground text-xs">{etaLabel}</p>
        </div>
      </div>
      <span className={priceClass}>
        {isFree ? "FREE" : formatUSD(rate.amount_cents)}
      </span>
    </button>
  )
})
