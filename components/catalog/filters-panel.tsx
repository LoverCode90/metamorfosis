"use client"

import { Search } from "lucide-react"
import {
  BRANDS,
  CATEGORIES,
  PRICE_CEILING,
  countByBrand,
  countByCategory,
  type ActiveFilters,
} from "@/lib/catalog"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface FiltersPanelProps {
  filters: ActiveFilters
  onChange: (next: ActiveFilters) => void
  onClear: () => void
}

export function FiltersPanel({
  filters,
  onChange,
  onClear,
}: FiltersPanelProps) {
  function toggleCategory(category: string) {
    const next = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    onChange({ ...filters, categories: next })
  }

  function toggleBrand(brand: string) {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand]
    onChange({ ...filters, brands: next })
  }

  const activeCount =
    filters.categories.length +
    filters.brands.length +
    (filters.search ? 1 : 0) +
    (filters.maxPrice < PRICE_CEILING ? 1 : 0)

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Filters
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="relative block">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search products"
            className="border-border bg-background text-foreground focus:border-foreground placeholder:text-muted-foreground h-10 w-full rounded-md border pr-3 pl-9 text-sm transition-colors outline-none"
          />
        </label>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-foreground text-xs font-semibold tracking-wide uppercase">
          Max Price
        </h3>
        <input
          type="range"
          min={0}
          max={PRICE_CEILING}
          step={1}
          value={filters.maxPrice}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          aria-label="Maximum price"
          className="accent-foreground mt-3 w-full"
        />
        <div className="text-muted-foreground mt-1.5 flex items-center justify-between text-xs tabular-nums">
          <span>{formatUSD(0)}</span>
          <span className="text-foreground font-medium">
            up to {formatUSD(filters.maxPrice)}
          </span>
        </div>
      </div>

      {/* Category */}
      <FilterGroup title="Category">
        {CATEGORIES.map((c) => (
          <CheckRow
            key={c}
            label={c}
            count={countByCategory(c)}
            checked={filters.categories.includes(c)}
            onToggle={() => toggleCategory(c)}
          />
        ))}
      </FilterGroup>

      {/* Brand */}
      <FilterGroup title="Brand">
        {BRANDS.map((b) => (
          <CheckRow
            key={b}
            label={b}
            count={countByBrand(b)}
            checked={filters.brands.includes(b)}
            onToggle={() => toggleBrand(b)}
          />
        ))}
      </FilterGroup>
    </div>
  )
}

function FilterGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-foreground text-xs font-semibold tracking-wide uppercase">
        {title}
      </h3>
      <ul className="mt-3 flex flex-col gap-0.5">{children}</ul>
    </div>
  )
}

function CheckRow({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string
  count: number
  checked: boolean
  onToggle: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="hover:text-foreground flex w-full items-center justify-between gap-2 rounded-md py-1.5 text-left text-sm transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
              checked
                ? "border-foreground bg-foreground text-background"
                : "border-border",
            )}
          >
            {checked && (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                <path
                  d="M2.5 6.5l2.5 2.5 4.5-5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span
            className={cn(
              checked ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {count}
        </span>
      </button>
    </li>
  )
}
