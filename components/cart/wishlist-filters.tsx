"use client"

import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

export function WishlistPriceSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100

  function clampStep(raw: number) {
    return Math.round(Math.max(min, Math.min(max, raw)))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span className="text-foreground font-medium">
          {formatUSD(value[0])}
        </span>
        <span>–</span>
        <span className="text-foreground font-medium">
          {formatUSD(value[1])}
        </span>
      </div>
      <div className="bg-muted relative h-1.5 w-full rounded-full">
        <div
          className="bg-foreground absolute h-full rounded-full"
          style={{
            left: `${pct(value[0])}%`,
            right: `${100 - pct(value[1])}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={(e) =>
            onChange([
              Math.min(clampStep(Number(e.target.value)), value[1] - 1),
              value[1],
            ])
          }
          aria-label="Minimum price"
          className="[&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:bg-background absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={(e) =>
            onChange([
              value[0],
              Math.max(clampStep(Number(e.target.value)), value[0] + 1),
            ])
          }
          aria-label="Maximum price"
          className="[&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:bg-background absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2"
        />
      </div>
    </div>
  )
}

export function WishlistFilterSidebar({
  brands,
  selectedBrands,
  onBrandToggle,
  priceRange,
  priceValue,
  onPriceChange,
  onClear,
  activeCount,
}: {
  brands: { name: string; count: number }[]
  selectedBrands: Set<string>
  onBrandToggle: (b: string) => void
  priceRange: [number, number]
  priceValue: [number, number]
  onPriceChange: (v: [number, number]) => void
  onClear: () => void
  activeCount: number
}) {
  return (
    <aside className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm font-semibold">Filters</span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground text-xs font-medium underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>

      {brands.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Brand
          </p>
          <ul className="flex flex-col gap-2">
            {brands.map(({ name, count }) => {
              const checked = selectedBrands.has(name)
              return (
                <li key={name}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onBrandToggle(name)}
                      className="border-border accent-foreground h-4 w-4 rounded"
                    />
                    <span
                      className={cn(
                        "flex-1",
                        checked ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {name}
                    </span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {count}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {priceRange[0] < priceRange[1] && (
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Price Range
          </p>
          <WishlistPriceSlider
            min={priceRange[0]}
            max={priceRange[1]}
            value={priceValue}
            onChange={onPriceChange}
          />
        </div>
      )}
    </aside>
  )
}
