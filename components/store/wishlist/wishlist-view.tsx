"use client"

import { useMemo, useState } from "react"
import { Heart, LayoutGrid, List, Search, ShoppingBag, Trash2 } from "lucide-react"
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

export function WishlistView() {
  const { wishlist, removeFromWishlist, addToCart, setView } = useCart()
  const items = wishlist as WishItem[]

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("added")
  const [grid, setGrid] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Adaptive facets — only categories actually present in the wishlist.
  const categories = useMemo(() => {
    const set = new Map<string, number>()
    for (const i of items) {
      if (i.category) set.set(i.category, (set.get(i.category) ?? 0) + 1)
    }
    return [...set.entries()].sort((a, b) => b[1] - a[1])
  }, [items])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = items.filter((i) => {
      if (q && !i.name.toLowerCase().includes(q)) return false
      if (activeCategory && i.category !== activeCategory) return false
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
  }, [items, search, activeCategory, sort])

  // Empty state.
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <Header count={0} />
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <Header count={items.length} />

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
          <label className="sr-only" htmlFor="wishlist-sort">
            Sort
          </label>
          <select
            id="wishlist-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

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

      {/* Adaptive category facets — only render when there is something to filter */}
      {categories.length > 1 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Facet active={activeCategory === null} onClick={() => setActiveCategory(null)}>
            All
            <FacetCount>{items.length}</FacetCount>
          </Facet>
          {categories.map(([cat, count]) => (
            <Facet
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              <FacetCount>{count}</FacetCount>
            </Facet>
          ))}
        </div>
      )}

      {/* Results */}
      {visible.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No saved items match</p>
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setActiveCategory(null)
            }}
            className="mt-2 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Clear filters
          </button>
        </div>
      ) : grid ? (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
        <ul className="mt-6 flex flex-col divide-y divide-border rounded-xl border border-border">
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
  )
}

function Header({ count }: { count: number }) {
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

function Facet({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function FacetCount({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] tabular-nums opacity-70">{children}</span>
}
