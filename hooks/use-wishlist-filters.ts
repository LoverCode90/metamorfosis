"use client"

import { useMemo, useState } from "react"

import { useDebounce } from "@/hooks/use-debounce"
import type { WishItem } from "@/components/cart/wishlist-item"

export type WishlistSortKey = "added" | "price-asc" | "price-desc" | "name"

/** Selectable sort orders for the wishlist, in display order. */
export const WISHLIST_SORTS: { id: WishlistSortKey; label: string }[] = [
  { id: "added", label: "Recently added" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name A–Z" },
]

/** Net (post-discount) price of a wishlist item. */
function netPrice(item: WishItem): number {
  return item.unitPrice - item.discountPerItem
}

export interface UseWishlistFiltersResult {
  search: string
  setSearch: (v: string) => void
  sort: WishlistSortKey
  setSort: (v: WishlistSortKey) => void
  brands: { name: string; count: number }[]
  selectedBrands: Set<string>
  toggleBrand: (brand: string) => void
  clearFilters: () => void
  /** Min/max net price across all items. */
  priceRange: [number, number]
  /** Currently applied price window (defaults to the full range). */
  priceValue: [number, number]
  setPriceValue: (v: [number, number]) => void
  activeFilterCount: number
  /** Whether any sidebar filter (brand or price) is meaningful. */
  hasSidebarFilters: boolean
  /** Items after search, brand, price filtering and sorting. */
  visible: WishItem[]
}

/**
 * Encapsulates all wishlist search/sort/filter state and derivations so the
 * view stays presentational.
 * @param items - The raw wishlist items.
 */
export function useWishlistFilters(
  items: WishItem[],
): UseWishlistFiltersResult {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [sort, setSort] = useState<WishlistSortKey>("added")
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())
  const [activePriceValue, setActivePriceValue] = useState<
    [number, number] | null
  >(null)

  const priceRange = useMemo<[number, number]>(() => {
    if (items.length === 0) return [0, 0]
    const prices = items.map(netPrice)
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [items])

  const priceValue: [number, number] = activePriceValue ?? priceRange

  const brands = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of items) {
      if (i.brand) map.set(i.brand, (map.get(i.brand) ?? 0) + 1)
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [items])

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev)
      if (next.has(brand)) next.delete(brand)
      else next.add(brand)
      return next
    })
  }

  function clearFilters() {
    setSelectedBrands(new Set())
    setActivePriceValue(null)
    setSearch("")
  }

  const priceIsNarrowed =
    activePriceValue !== null &&
    (activePriceValue[0] > priceRange[0] || activePriceValue[1] < priceRange[1])
  const activeFilterCount = selectedBrands.size + (priceIsNarrowed ? 1 : 0)

  const visible = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    const [lo, hi] = priceValue
    const list = items.filter((i) => {
      if (q && !i.name.toLowerCase().includes(q)) return false
      if (selectedBrands.size > 0 && i.brand && !selectedBrands.has(i.brand))
        return false
      const fp = netPrice(i)
      return fp >= lo && fp <= hi
    })
    return [...list].sort((a, b) => {
      if (sort === "price-asc") return netPrice(a) - netPrice(b)
      if (sort === "price-desc") return netPrice(b) - netPrice(a)
      if (sort === "name") return a.name.localeCompare(b.name)
      return 0
    })
  }, [items, debouncedSearch, selectedBrands, priceValue, sort])

  const hasSidebarFilters = brands.length > 0 || priceRange[0] < priceRange[1]

  return {
    search,
    setSearch,
    sort,
    setSort,
    brands,
    selectedBrands,
    toggleBrand,
    clearFilters,
    priceRange,
    priceValue,
    setPriceValue: setActivePriceValue,
    activeFilterCount,
    hasSidebarFilters,
    visible,
  }
}
