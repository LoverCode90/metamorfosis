"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { FilterCategoryTree } from "@/components/catalog/filter-category-tree"
import { FilterPrice } from "@/components/catalog/filter-price"
import { FilterSearch } from "@/components/catalog/filter-search"
import { useDebouncedSearch } from "@/hooks/use-debounced-search"
import type { ActiveFilters } from "@/lib/catalog"
import { MAX_PRICE_CENTS } from "@/lib/catalog/filter-constants"

interface FiltersPanelProps {
  filters: ActiveFilters
  onChange: (next: ActiveFilters) => void
  onClear: () => void
}

/**
 * Catalog filter sidebar: debounced search, a max-price slider, and a
 * collapsible category checklist. Presentational — all derived state lives in
 * the child components and {@link useDebouncedSearch}.
 */
export function FiltersPanel({
  filters,
  onChange,
  onClear,
}: FiltersPanelProps) {
  const [openParents, setOpenParents] = useState<Set<string>>(new Set())
  const [search, setSearch] = useDebouncedSearch(filters.search, (value) =>
    onChange({ ...filters, search: value }),
  )

  function toggleParentOpen(parent: string) {
    setOpenParents((prev) => {
      const next = new Set(prev)
      if (next.has(parent)) next.delete(parent)
      else next.add(parent)
      return next
    })
  }

  function toggleCategory(cat: string) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    onChange({ ...filters, categories: next })
  }

  const priceIsActive =
    Number.isFinite(filters.maxPrice) && filters.maxPrice < MAX_PRICE_CENTS
  const activeCount =
    filters.categories.length +
    (filters.search ? 1 : 0) +
    (priceIsActive ? 1 : 0)

  return (
    <div className="flex max-h-[calc(100vh-120px)] flex-col gap-7 overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Filters
        </h2>
        {activeCount > 0 && (
          <Button
            variant="link"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground h-auto p-0"
          >
            Clear all
          </Button>
        )}
      </div>

      <FilterSearch value={search} onChange={setSearch} />

      <FilterPrice
        maxPrice={filters.maxPrice}
        onChange={(cents) => onChange({ ...filters, maxPrice: cents })}
      />

      <FilterCategoryTree
        selected={filters.categories}
        open={openParents}
        onToggleOpen={toggleParentOpen}
        onToggleCategory={toggleCategory}
      />
    </div>
  )
}
