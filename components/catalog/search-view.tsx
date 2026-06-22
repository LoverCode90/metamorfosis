"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search as SearchIcon } from "lucide-react"
import { ProductCard } from "./product-card"
import type { CatalogCard } from "@/lib/catalog"

/**
 * Client-side search. The server pre-fetches all CatalogCards and we filter
 * by name_en (case-insensitive substring — same semantics as Supabase ilike).
 * Input is debounced 300ms before the visible result list updates.
 */
export function SearchView({ cards }: { cards: CatalogCard[] }) {
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(id)
  }, [query])

  const results = useMemo(() => {
    if (!debounced) return cards
    const needle = debounced.toLowerCase()
    return cards.filter((c) => c.nameEn.toLowerCase().includes(needle))
  }, [debounced, cards])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/products"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to catalog
      </Link>

      <div className="mt-6 flex flex-col gap-2">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Search products
        </h1>
        <div className="relative mt-3">
          <SearchIcon
            className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
            strokeWidth={1.75}
          />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name…"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-14 w-full rounded-xl border pr-4 pl-12 text-base transition-colors outline-none"
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="mt-8">
        {debounced && results.length === 0 ? (
          <div className="border-border bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
            <SearchIcon
              className="text-muted-foreground h-6 w-6"
              strokeWidth={1.5}
            />
            <p className="text-foreground mt-4 text-base font-semibold">
              No products found for &ldquo;{debounced}&rdquo;
            </p>
            <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
              Try a different spelling or a broader term.
            </p>
          </div>
        ) : (
          <>
            {debounced && (
              <p className="text-muted-foreground mb-4 text-sm">
                {results.length} {results.length === 1 ? "result" : "results"}{" "}
                for &ldquo;{debounced}&rdquo;
              </p>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {results.map((card) => (
                <ProductCard key={card.squareProductId} product={card} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
