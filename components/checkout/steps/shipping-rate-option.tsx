"use client"

import { memo } from "react"
import { Check } from "lucide-react"

import type { ShippingMethod, ShippingRate } from "@/lib/checkout/types"
import { cn } from "@/lib/utils"

interface ShippingRateOptionProps {
  rate: ShippingRate
  selected: boolean
  onSelect: (method: ShippingMethod) => void
}

/** Selectable shipping-rate row (memoized — rendered in a list). */
export const ShippingRateOption = memo(function ShippingRateOption({
  rate,
  selected,
  onSelect,
}: ShippingRateOptionProps) {
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
  const priceClass = cn(
    "text-sm font-semibold tabular-nums",
    rate.amountCents === 0 ? "text-green-500" : "text-foreground",
  )

  return (
    <button
      type="button"
      onClick={() => onSelect(rate.method)}
      className={rowClass}
    >
      <div className="flex items-center gap-3">
        <span className={radioClass}>
          {selected && (
            <Check className="text-background h-2.5 w-2.5" strokeWidth={3} />
          )}
        </span>
        <div>
          <p className="text-foreground text-sm font-medium">{rate.label}</p>
          <p className="text-muted-foreground text-xs">{rate.description}</p>
        </div>
      </div>
      <span className={priceClass}>{rate.display}</span>
    </button>
  )
})
