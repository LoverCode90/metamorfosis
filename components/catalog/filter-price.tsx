"use client"

import { Slider } from "@/components/ui/slider"
import { MAX_PRICE_CENTS } from "@/lib/catalog/filter-constants"
import { formatUSD } from "@/lib/utils/format"

interface FilterPriceProps {
  /** Current max-price filter in cents (may be `Infinity` for "no cap"). */
  maxPrice: number
  onChange: (cents: number) => void
}

/** Max-price slider capped at {@link MAX_PRICE_CENTS}, with a live $ label. */
export function FilterPrice({ maxPrice, onChange }: FilterPriceProps) {
  const value = Number.isFinite(maxPrice)
    ? Math.min(maxPrice, MAX_PRICE_CENTS)
    : MAX_PRICE_CENTS

  return (
    <div>
      <h3 className="text-foreground text-xs font-semibold tracking-wide uppercase">
        Max Price
      </h3>
      <Slider
        className="mt-3"
        min={0}
        max={MAX_PRICE_CENTS}
        step={100}
        value={value}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
      <div className="text-muted-foreground mt-1.5 flex items-center justify-between text-xs tabular-nums">
        <span>{formatUSD(0)}</span>
        <span className="text-foreground font-medium">
          up to {formatUSD(value)}
        </span>
      </div>
    </div>
  )
}
