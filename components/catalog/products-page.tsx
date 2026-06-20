"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import {
  EMPTY_FILTERS,
  filterCatalogCards,
  type ActiveFilters,
  type CatalogCard,
} from "@/lib/catalog"
import { ProductCard } from "./product-card"
import { FiltersPanel } from "./filters-panel"
import { FiltersDrawer } from "./filters-drawer"
import { Pagination } from "./pagination"

const PER_PAGE = 20

interface ProductsPageProps {
  products: CatalogCard[]
  maxPrice: number
}

export function ProductsPage({ products, maxPrice }: ProductsPageProps) {
  const [filters, setFilters] = useState<ActiveFilters>({
    ...EMPTY_FILTERS,
    maxPrice,
  })
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(
    () => filterCatalogCards(products, filters),
    [products, filters],
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * PER_PAGE
  const visible = filtered.slice(start, start + PER_PAGE)

  function updateFilters(next: ActiveFilters) {
    setFilters(next)
    setPage(1)
  }

  function clearFilters() {
    setFilters({ ...EMPTY_FILTERS, maxPrice })
    setPage(1)
  }

  function goToPage(p: number) {
    setPage(p)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const activeCount = filters.categories.length + (filters.search ? 1 : 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12 xl:max-w-7xl 2xl:max-w-[1600px]">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          Catalog
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          All Products
        </h1>
      </div>

      <div className="mt-8 flex gap-10">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <FiltersPanel
              filters={filters}
              maxPrice={maxPrice}
              onChange={updateFilters}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 pb-5">
            <p className="text-muted-foreground text-sm">
              Showing{" "}
              <span className="text-foreground font-medium">
                {filtered.length === 0 ? 0 : start + 1}–
                {Math.min(start + PER_PAGE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="text-foreground font-medium">
                {filtered.length}
              </span>{" "}
              results
            </p>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="border-border text-foreground hover:bg-muted inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
              Filters
              {activeCount > 0 && (
                <span className="bg-foreground text-background flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {visible.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 lg:gap-x-6 xl:grid-cols-4 2xl:grid-cols-4 2xl:gap-x-8">
              {visible.map((card) => (
                <ProductCard key={card.squareProductId} product={card} />
              ))}
            </div>
          ) : (
            <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
              <p className="text-foreground text-sm font-medium">
                No products match your filters
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground mt-3 text-sm font-medium underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          )}

          {visible.length > 0 && (
            <div className="mt-12">
              <Pagination
                page={safePage}
                pageCount={pageCount}
                onChange={goToPage}
              />
            </div>
          )}
        </div>
      </div>

      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        resultCount={filtered.length}
      >
        <FiltersPanel
          filters={filters}
          maxPrice={maxPrice}
          onChange={updateFilters}
          onClear={clearFilters}
        />
      </FiltersDrawer>
    </div>
  )
}
