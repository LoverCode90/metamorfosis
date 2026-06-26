"use client"

import { Search, SlidersHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { WishlistViewToggle } from "@/components/cart/wishlist-item"
import {
  WISHLIST_SORTS,
  type WishlistSortKey,
} from "@/hooks/use-wishlist-filters"

interface WishlistToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  sort: WishlistSortKey
  onSortChange: (v: WishlistSortKey) => void
  grid: boolean
  onGridChange: (grid: boolean) => void
  /** Whether the mobile "Filter" trigger should be shown. */
  showFilterButton: boolean
  activeFilterCount: number
  onOpenFilters: () => void
}

/** Search box, sort select, mobile filter trigger, and grid/list view toggle. */
export function WishlistToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  grid,
  onGridChange,
  showFilterButton,
  activeFilterCount,
  onOpenFilters,
}: WishlistToolbarProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          strokeWidth={1.75}
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by product name"
          aria-label="Search wishlist"
          className="h-11 pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="wishlist-sort">
          Sort
        </label>
        <NativeSelect
          id="wishlist-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as WishlistSortKey)}
          className="h-11 w-auto"
        >
          {WISHLIST_SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </NativeSelect>
        {showFilterButton && (
          <Button
            variant="outline"
            size="lg"
            onClick={onOpenFilters}
            className="h-11 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
            Filter
            {activeFilterCount > 0 && <Badge>{activeFilterCount}</Badge>}
          </Button>
        )}
        <div className="border-border hidden items-center rounded-md border p-0.5 sm:flex">
          <WishlistViewToggle
            active={grid}
            onClick={() => onGridChange(true)}
            view="grid"
          />
          <WishlistViewToggle
            active={!grid}
            onClick={() => onGridChange(false)}
            view="list"
          />
        </div>
      </div>
    </div>
  )
}
