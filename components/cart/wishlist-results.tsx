"use client"

import { Button } from "@/components/ui/button"
import {
  WishlistCard,
  WishlistRow,
  type WishItem,
} from "@/components/cart/wishlist-item"

interface WishlistResultsProps {
  items: WishItem[]
  grid: boolean
  onRemove: (item: WishItem) => void
  onAdd: (item: WishItem) => void
  onClearFilters: () => void
}

/** Stable key for a wishlist item (variation id, falling back to product id). */
function itemKey(item: WishItem): string {
  return item.variationId ?? item.id
}

/** Renders the filtered wishlist as a grid or list, or a no-match state. */
export function WishlistResults({
  items,
  grid,
  onRemove,
  onAdd,
  onClearFilters,
}: WishlistResultsProps) {
  if (items.length === 0) {
    return (
      <div className="border-border rounded-xl border border-dashed py-16 text-center">
        <p className="text-foreground text-sm font-medium">
          No saved items match
        </p>
        <Button variant="link" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    )
  }

  if (grid) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <WishlistCard
            key={itemKey(item)}
            item={item}
            onRemove={() => onRemove(item)}
            onAdd={() => onAdd(item)}
          />
        ))}
      </div>
    )
  }

  return (
    <ul className="divide-border border-border flex flex-col divide-y rounded-xl border">
      {items.map((item) => (
        <WishlistRow
          key={itemKey(item)}
          item={item}
          onRemove={() => onRemove(item)}
          onAdd={() => onAdd(item)}
        />
      ))}
    </ul>
  )
}
