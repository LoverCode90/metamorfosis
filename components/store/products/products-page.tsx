"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import {
  CATALOG,
  EMPTY_FILTERS,
  filterCatalog,
  type ActiveFilters,
} from "@/lib/catalog"
import { ProductCard } from "./product-card"
import { FiltersPanel } from "./filters-panel"
import { FiltersDrawer } from "./filters-drawer"
import { Pagination } from "./pagination"

const PER_PAGE = 20

export function ProductsPage() {
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() => filterCatalog(CATALOG, filters), [filters])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * PER_PAGE
  const visible = filtered.slice(start, start + PER_PAGE)

  // Any filter change resets to page 1.
  function updateFilters(next: ActiveFilters) {
    setFilters(next)
    setPage(1)
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  function goToPage(p: number) {
    setPage(p)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const activeCount =
    filters.categories.length + filters.brands.length + (filters.search ? 1 : 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12 xl:max-w-7xl 2xl:max-w-[1600px]">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          All Products
        </h1>
      </div>

      <div className="mt-8 flex gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <FiltersPanel
              filters={filters}
              onChange={updateFilters}
              onClear={clearFilters}
            />
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 pb-5">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filtered.length === 0 ? 0 : start + 1}–
                {Math.min(start + PER_PAGE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>{" "}
              results
            </p>

            {/* Mobile filters trigger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
              Filters
              {activeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Grid */}
          {visible.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 lg:gap-x-6 xl:grid-cols-4 2xl:grid-cols-4 2xl:gap-x-8">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <p className="text-sm font-medium text-foreground">
                No products match your filters
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-sm font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
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

      {/* Mobile drawer */}
      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        resultCount={filtered.length}
      >
        <FiltersPanel
          filters={filters}
          onChange={updateFilters}
          onClear={clearFilters}
        />
      </FiltersDrawer>
    </div>
  )
}
