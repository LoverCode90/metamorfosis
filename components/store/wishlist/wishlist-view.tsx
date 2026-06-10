"use client"

import { useMemo, useRef, useState } from "react"
import { Heart, LayoutGrid, List, Search, ShoppingBag, SlidersHorizontal, Trash2, X } from "lucide-react"
import type { CatalogProduct } from "@/lib/catalog"
import { formatUSD, type Product } from "@/lib/checkout"
import { cn } from "@/lib/utils"
import { useCart } from "../cart-context"

type SortKey = "added" | "price-asc" | "price-desc" | "name"

const SORTS: { id: SortKey; label: string }[] = [
  { id: "added", label: "Recently added" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name A–Z" },
]

/** Wishlist items may originate from the catalog (with facets) or the cart. */
type WishItem = Product & Partial<Pick<CatalogProduct, "category" | "brand" | "isProfessional">>

// ─── Price range slider ────────────────────────────────────────────────────

function PriceSlider({
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
  const trackRef = useRef<HTMLDivElement>(null)

  const pct = (v: number) => ((v - min) / (max - min)) * 100

  function clampStep(raw: number) {
    return Math.round(Math.max(min, Math.min(max, raw)))
  }

  function handleLow(e: React.ChangeEvent<HTMLInputElement>) {
    const next = clampStep(Number(e.target.value))
    onChange([Math.min(next, value[1] - 1), value[1]])
  }

  function handleHigh(e: React.ChangeEvent<HTMLInputElement>) {
    const next = clampStep(Number(e.target.value))
    onChange([value[0], Math.max(next, value[0] + 1)])
  }

  const loP = pct(value[0])
  const hiP = pct(value[1])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{formatUSD(value[0])}</span>
        <span>–</span>
        <span className="font-medium text-foreground">{formatUSD(value[1])}</span>
      </div>

      {/* Track + filled range */}
      <div ref={trackRef} className="relative h-1.5 w-full rounded-full bg-muted">
        <div
          className="absolute h-full rounded-full bg-foreground"
          style={{ left: `${loP}%`, right: `${100 - hiP}%` }}
        />

        {/* Low thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={handleLow}
          aria-label="Minimum price"
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:bg-background"
        />

        {/* High thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={handleHigh}
          aria-label="Maximum price"
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:bg-background"
        />
      </div>
    </div>
  )
}

// ─── Sidebar / filter panel ────────────────────────────────────────────────

function FilterSidebar({
  items,
  brands,
  selectedBrands,
  onBrandToggle,
  priceRange,
  priceValue,
  onPriceChange,
  onClear,
  activeCount,
}: {
  items: WishItem[]
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
        <span className="text-sm font-semibold text-foreground">Filters</span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Brand checkboxes */}
      {brands.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                      className="h-4 w-4 rounded border-border accent-foreground"
                    />
                    <span className={cn("flex-1", checked ? "text-foreground" : "text-muted-foreground")}>
                      {name}
                    </span>
                    <span className="tabular-nums text-xs text-muted-foreground">{count}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Price range slider */}
      {priceRange[0] < priceRange[1] && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Price Range
          </p>
          <PriceSlider
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

// ─── Main component ────────────────────────────────────────────────────────

export function WishlistView() {
  const { wishlist, removeFromWishlist, addToCart, setView } = useCart()
  const items = wishlist as WishItem[]

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("added")
  const [grid, setGrid] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Brand facet state
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())

  // Derive min/max price across the entire wishlist
  const [priceRange, priceValue, setPriceValue] = useMemo(() => {
    if (items.length === 0) return [[0, 0] as [number, number], [0, 0] as [number, number], (_v: [number, number]) => {}]
    const prices = items.map((i) => i.unitPrice - i.discountPerItem)
    const lo = Math.floor(Math.min(...prices))
    const hi = Math.ceil(Math.max(...prices))
    return [[lo, hi] as [number, number], [lo, hi] as [number, number], (_v: [number, number]) => {}]
  }, [items]) // eslint-disable-line react-hooks/exhaustive-deps — handled separately below

  const [activePriceValue, setActivePriceValue] = useState<[number, number] | null>(null)

  const derivedPriceRange = useMemo<[number, number]>(() => {
    if (items.length === 0) return [0, 0]
    const prices = items.map((i) => i.unitPrice - i.discountPerItem)
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [items])

  const currentPriceValue: [number, number] = activePriceValue ?? derivedPriceRange

  // Adaptive brand facets
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
      if (next.has(b)) next.delete(b)
      else next.add(b)
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
    (activePriceValue[0] > derivedPriceRange[0] || activePriceValue[1] < derivedPriceRange[1])
      ? 1
      : 0)

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const [lo, hi] = currentPriceValue
    let list = items.filter((i) => {
      if (q && !i.name.toLowerCase().includes(q)) return false
      if (selectedBrands.size > 0 && i.brand && !selectedBrands.has(i.brand)) return false
      const fp = i.unitPrice - i.discountPerItem
      if (fp < lo || fp > hi) return false
      return true
    })
    list = [...list].sort((a, b) => {
      const ap = a.unitPrice - a.discountPerItem
      const bp = b.unitPrice - b.discountPerItem
      if (sort === "price-asc") return ap - bp
      if (sort === "price-desc") return bp - ap
      if (sort === "name") return a.name.localeCompare(b.name)
      return 0
    })
    return list
  }, [items, search, selectedBrands, currentPriceValue, sort])

  // Empty state
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <WishlistHeader count={0} />
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Heart className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </span>
          <p className="mt-5 text-base font-semibold text-foreground">
            Your wishlist is empty
          </p>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Tap the heart on any product to save it here for later.
          </p>
          <button
            type="button"
            onClick={() => setView("products")}
            className="mt-6 inline-flex h-11 items-center rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Browse products
          </button>
        </div>
      </div>
    )
  }

  const hasBrandOrPriceFilters = brands.length > 0 || derivedPriceRange[0] < derivedPriceRange[1]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <WishlistHeader count={items.length} />

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name"
            aria-label="Search wishlist"
            className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="wishlist-sort">Sort</label>
          <select
            id="wishlist-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          {/* Mobile filter trigger */}
          {hasBrandOrPriceFilters && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
              Filter
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          <div className="hidden items-center rounded-md border border-border p-0.5 sm:flex">
            <ViewToggle active={grid} onClick={() => setGrid(true)} label="Grid view">
              <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
            </ViewToggle>
            <ViewToggle active={!grid} onClick={() => setGrid(false)} label="List view">
              <List className="h-4 w-4" strokeWidth={1.75} />
            </ViewToggle>
          </div>
        </div>
      </div>

      {/* Two-column layout: sidebar + results */}
      <div className="mt-8 flex gap-10">
        {/* Desktop filter sidebar */}
        {hasBrandOrPriceFilters && (
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
              <FilterSidebar
                items={items}
                brands={brands}
                selectedBrands={selectedBrands}
                onBrandToggle={toggleBrand}
                priceRange={derivedPriceRange}
                priceValue={currentPriceValue}
                onPriceChange={(v) => setActivePriceValue(v)}
                onClear={clearFilters}
                activeCount={activeFilterCount}
              />
            </div>
          </aside>
        )}

        {/* Results */}
        <div className="min-w-0 flex-1">
          {visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-sm font-medium text-foreground">No saved items match</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Clear filters
              </button>
            </div>
          ) : grid ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
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
            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
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

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          {/* Panel */}
          <div className="relative z-10 w-full rounded-t-2xl bg-background px-5 pb-10 pt-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Filters</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <FilterSidebar
              items={items}
              brands={brands}
              selectedBrands={selectedBrands}
              onBrandToggle={toggleBrand}
              priceRange={derivedPriceRange}
              priceValue={currentPriceValue}
              onPriceChange={(v) => setActivePriceValue(v)}
              onClear={clearFilters}
              activeCount={activeFilterCount}
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background"
            >
              Show {visible.length} {visible.length === 1 ? "item" : "items"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function WishlistHeader({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
        My Account
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        My Wishlist
      </h1>
      <p className="text-sm text-muted-foreground">
        Public List · {count} {count === 1 ? "item" : "items"}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
function WishlistCard({
  item,
  onRemove,
  onAdd,
}: {
  item: WishItem
  onRemove: () => void
  onAdd: () => void
}) {
  const finalPrice = item.unitPrice - item.discountPerItem
  const hasDiscount = item.discountPerItem > 0
  const lowStock = item.stock <= 10

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
        {hasDiscount && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-background">
            Save {formatUSD(item.discountPerItem)}
          </span>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name} from wishlist`}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-destructive hover:text-background"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col pt-3">
        {item.brand && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {item.brand}
          </p>
        )}
        <p className="mt-1 text-sm font-medium leading-snug text-foreground">{item.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.variant}</p>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {formatUSD(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {formatUSD(item.unitPrice)}
            </span>
          )}
        </div>

        {lowStock && (
          <p className="mt-1 text-xs font-medium text-foreground">
            Only {item.stock} left in stock
          </p>
        )}

        <button
          type="button"
          onClick={onAdd}
          className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-semibold text-background transition-opacity hover:opacity-90"
        >
          <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
          Add to Cart
        </button>
      </div>
    </article>
  )
}

function WishlistRow({
  item,
  onRemove,
  onAdd,
}: {
  item: WishItem
  onRemove: () => void
  onAdd: () => void
}) {
  const finalPrice = item.unitPrice - item.discountPerItem
  const hasDiscount = item.discountPerItem > 0

  return (
    <li className="flex items-center gap-4 p-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
        <p className="truncate text-xs text-muted-foreground">{item.variant}</p>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {formatUSD(finalPrice)}
        </span>
        {hasDiscount && (
          <span className="hidden text-xs text-muted-foreground line-through tabular-nums sm:inline">
            {formatUSD(item.unitPrice)}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-semibold text-background transition-opacity hover:opacity-90"
      >
        <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
        <span className="hidden sm:inline">Add to Cart</span>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Small primitives
// ---------------------------------------------------------------------------
function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
