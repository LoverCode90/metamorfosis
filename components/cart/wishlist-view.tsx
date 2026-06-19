"use client"

import { useMemo, useState } from "react"
import { Heart, Search, SlidersHorizontal, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import {
  WishlistCard,
  WishlistRow,
  WishlistViewToggle,
  type WishItem,
} from "./wishlist-item"
import { WishlistFilterSidebar } from "./wishlist-filters"

type SortKey = "added" | "price-asc" | "price-desc" | "name"

const SORTS: { id: SortKey; label: string }[] = [
  { id: "added", label: "Recently added" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name A–Z" },
]

export function WishlistView() {
  const router = useRouter()
  const { wishlist, removeFromWishlist, addToCart } = useCart()
  const items = wishlist as WishItem[]

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("added")
  const [grid, setGrid] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())
  const [activePriceValue, setActivePriceValue] = useState<
    [number, number] | null
  >(null)

  const derivedPriceRange = useMemo<[number, number]>(() => {
    if (items.length === 0) return [0, 0]
    const prices = items.map((i) => i.unitPrice - i.discountPerItem)
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [items])

  const currentPriceValue: [number, number] =
    activePriceValue ?? derivedPriceRange

  const brands = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of items) {
      if (i.brand) map.set(i.brand, (map.get(i.brand) ?? 0) + 1)
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [items])

  function toggleBrand(b: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev)
      if (next.has(b)) {
        next.delete(b)
      } else {
        next.add(b)
      }
      return next
    })
  }

  function clearFilters() {
    setSelectedBrands(new Set())
    setActivePriceValue(null)
    setSearch("")
  }

  const activeFilterCount =
    selectedBrands.size +
    (activePriceValue &&
    (activePriceValue[0] > derivedPriceRange[0] ||
      activePriceValue[1] < derivedPriceRange[1])
      ? 1
      : 0)

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const [lo, hi] = currentPriceValue
    const list = items.filter((i) => {
      if (q && !i.name.toLowerCase().includes(q)) return false
      if (selectedBrands.size > 0 && i.brand && !selectedBrands.has(i.brand))
        return false
      const fp = i.unitPrice - i.discountPerItem
      return fp >= lo && fp <= hi
    })
    return [...list].sort((a, b) => {
      const ap = a.unitPrice - a.discountPerItem
      const bp = b.unitPrice - b.discountPerItem
      if (sort === "price-asc") return ap - bp
      if (sort === "price-desc") return bp - ap
      if (sort === "name") return a.name.localeCompare(b.name)
      return 0
    })
  }, [items, search, selectedBrands, currentPriceValue, sort])

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <WishlistPageHeader count={0} />
        <div className="border-border mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center">
          <span className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
            <Heart
              className="text-muted-foreground h-6 w-6"
              strokeWidth={1.5}
            />
          </span>
          <p className="text-foreground mt-5 text-base font-semibold">
            Your wishlist is empty
          </p>
          <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
            Tap the heart on any product to save it here for later.
          </p>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="bg-foreground text-background mt-6 inline-flex h-11 items-center rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Browse products
          </button>
        </div>
      </div>
    )
  }

  const hasSidebarFilters =
    brands.length > 0 || derivedPriceRange[0] < derivedPriceRange[1]
  const filterProps = {
    brands,
    selectedBrands,
    onBrandToggle: toggleBrand,
    priceRange: derivedPriceRange,
    priceValue: currentPriceValue,
    onPriceChange: (v: [number, number]) => setActivePriceValue(v),
    onClear: clearFilters,
    activeCount: activeFilterCount,
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <WishlistPageHeader count={items.length} />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            strokeWidth={1.75}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name"
            aria-label="Search wishlist"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border pr-3 pl-9 text-sm transition-colors outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="wishlist-sort">
            Sort
          </label>
          <select
            id="wishlist-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border-border bg-background text-foreground focus:border-foreground h-11 rounded-md border px-3 text-sm transition-colors outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {hasSidebarFilters && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="border-border text-foreground hover:bg-muted inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-foreground text-background flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
          <div className="border-border hidden items-center rounded-md border p-0.5 sm:flex">
            <WishlistViewToggle
              active={grid}
              onClick={() => setGrid(true)}
              view="grid"
            />
            <WishlistViewToggle
              active={!grid}
              onClick={() => setGrid(false)}
              view="list"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-10">
        {hasSidebarFilters && (
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="border-border bg-card sticky top-24 rounded-xl border p-5">
              <WishlistFilterSidebar {...filterProps} />
            </div>
          </aside>
        )}
        <div className="min-w-0 flex-1">
          {visible.length === 0 ? (
            <div className="border-border rounded-xl border border-dashed py-16 text-center">
              <p className="text-foreground text-sm font-medium">
                No saved items match
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground mt-2 text-sm underline underline-offset-2"
              >
                Clear filters
              </button>
            </div>
          ) : grid ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {visible.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromWishlist(item.id)}
                  onAdd={() => addToCart(item)}
                />
              ))}
            </div>
          ) : (
            <ul className="divide-border border-border flex flex-col divide-y rounded-xl border">
              {visible.map((item) => (
                <WishlistRow
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromWishlist(item.id)}
                  onAdd={() => addToCart(item)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
            className="bg-foreground/40 absolute inset-0 backdrop-blur-sm"
          />
          <div className="bg-background relative z-10 w-full rounded-t-2xl px-5 pt-5 pb-10 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-foreground text-sm font-semibold">
                Filters
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                className="text-foreground hover:bg-muted flex h-9 w-9 items-center justify-center rounded-md"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <WishlistFilterSidebar {...filterProps} />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="bg-foreground text-background mt-6 inline-flex h-11 w-full items-center justify-center rounded-md text-sm font-semibold"
            >
              Show {visible.length} {visible.length === 1 ? "item" : "items"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function WishlistPageHeader({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
        My Account
      </p>
      <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
        My Wishlist
      </h1>
      <p className="text-muted-foreground text-sm">
        Public List · {count} {count === 1 ? "item" : "items"}
      </p>
    </div>
  )
}
