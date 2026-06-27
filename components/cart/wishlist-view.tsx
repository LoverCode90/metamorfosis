"use client"

import { useCallback, useState } from "react"

import { useCart } from "@/hooks/use-cart"
import { useWishlistFilters } from "@/hooks/use-wishlist-filters"
import { WishlistEmpty } from "@/components/cart/wishlist-empty"
import { WishlistFilterDrawer } from "@/components/cart/wishlist-filter-drawer"
import { WishlistPageHeader } from "@/components/cart/wishlist-page-header"
import { WishlistResults } from "@/components/cart/wishlist-results"
import { WishlistToolbar } from "@/components/cart/wishlist-toolbar"
import { WishlistFilterSidebar } from "@/components/cart/wishlist-filters"
import type { WishItem } from "@/components/cart/wishlist-item"

/**
 * Wishlist page: lets a user search, sort, filter (brand/price), and switch
 * between grid/list layouts over their saved items. All filtering logic lives
 * in {@link useWishlistFilters}; this component only wires state to UI.
 */
export function WishlistView() {
  const { wishlist, removeFromWishlist, addToCart } = useCart()
  const items = wishlist as WishItem[]

  const [grid, setGrid] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const filters = useWishlistFilters(items)

  // Stable references so the memoized WishlistCard / WishlistRow can skip
  // re-rendering when unrelated state (search, layout) changes.
  const handleRemove = useCallback(
    (item: WishItem) => removeFromWishlist(item.variationId ?? item.id),
    [removeFromWishlist],
  )
  const handleAdd = useCallback(
    (item: WishItem) => addToCart(item),
    [addToCart],
  )

  if (items.length === 0) {
    return <WishlistEmpty />
  }

  const sidebarProps = {
    brands: filters.brands,
    selectedBrands: filters.selectedBrands,
    onBrandToggle: filters.toggleBrand,
    onClear: filters.clearFilters,
    activeCount: filters.activeFilterCount,
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <WishlistPageHeader count={items.length} />

      <WishlistToolbar
        search={filters.search}
        onSearchChange={filters.setSearch}
        sort={filters.sort}
        onSortChange={filters.setSort}
        grid={grid}
        onGridChange={setGrid}
        showFilterButton={filters.hasSidebarFilters}
        activeFilterCount={filters.activeFilterCount}
        onOpenFilters={() => setDrawerOpen(true)}
      />

      <div className="mt-8 flex gap-10">
        {filters.hasSidebarFilters && (
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="border-border bg-card sticky top-24 rounded-xl border p-5">
              <WishlistFilterSidebar {...sidebarProps} />
            </div>
          </aside>
        )}
        <div className="min-w-0 flex-1">
          <WishlistResults
            items={filters.visible}
            grid={grid}
            onRemove={handleRemove}
            onAdd={handleAdd}
            onClearFilters={filters.clearFilters}
          />
        </div>
      </div>

      <WishlistFilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        resultCount={filters.visible.length}
        filters={sidebarProps}
      />
    </div>
  )
}
