"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import type { ActiveFilters } from "@/lib/catalog"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

const CATEGORY_TREE: { parent: string; children: string[] }[] = [
  {
    parent: "Hair Care",
    children: [
      "Shampoos",
      "Conditioners",
      "Hair Masks",
      "Intensive Treatments",
      "Oils & Serums",
    ],
  },
  {
    parent: "Hair Color",
    children: [
      "Permanent Color",
      "Semi & Demi-Permanent Color",
      "Developers & Peroxides",
      "Bleaches & Lighteners",
      "Color Tools & Accessories",
    ],
  },
  {
    parent: "Hair Styling",
    children: [
      "Gels & Waxes",
      "Hairsprays & Fixatives",
      "Styling Creams",
      "Heat Protectants",
      "Styling Tools",
    ],
  },
  {
    parent: "Nails",
    children: [
      "Acrylics & Monomers",
      "Gel & Nail Polish",
      "Primers, Base & Top Coats",
      "Treatments & Removers",
      "Nail Tips & Extensions",
      "Tools & Equipment",
      "Salon Disposables & Practice",
    ],
  },
  {
    parent: "Makeup",
    children: ["Face", "Eyes & Brows", "Lips", "Brushes & Tools"],
  },
  {
    parent: "Lashes",
    children: ["Eyelash Extensions", "Adhesives & Tools"],
  },
  {
    parent: "Barber & Men's Grooming",
    children: [
      "Hair & Beard Styling",
      "Shaving & Beard Care",
      "Clippers, Trimmers & Blades",
      "Barber Accessories & Apparel",
    ],
  },
  {
    parent: "Personal Care & Fragrances",
    children: ["Fragrances"],
  },
]

interface FiltersPanelProps {
  filters: ActiveFilters
  maxPrice: number
  onChange: (next: ActiveFilters) => void
  onClear: () => void
}

export function FiltersPanel({
  filters,
  maxPrice,
  onChange,
  onClear,
}: FiltersPanelProps) {
  const [openParents, setOpenParents] = useState<Set<string>>(new Set())

  // ── Debounced search ─────────────────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState(filters.search)

  // "Shadow" of the parent's search used to detect external resets (e.g. Clear all)
  const [lastParentSearch, setLastParentSearch] = useState(filters.search)
  if (filters.search !== lastParentSearch) {
    // Parent reset the search — sync local state during render (derived-state pattern)
    setLastParentSearch(filters.search)
    setLocalSearch(filters.search)
  }

  // Stable latest-value refs — updated in a layout effect (not during render)
  const onChangeRef = useRef(onChange)
  const filtersRef = useRef(filters)
  useLayoutEffect(() => {
    onChangeRef.current = onChange
    filtersRef.current = filters
  })

  // Push debounced search value to parent
  useEffect(() => {
    const t = setTimeout(() => {
      onChangeRef.current({ ...filtersRef.current, search: localSearch })
    }, 400)
    return () => clearTimeout(t)
  }, [localSearch])
  // ─────────────────────────────────────────────────────────────────────────

  function toggleParentOpen(parent: string) {
    setOpenParents((prev) => {
      const next = new Set(prev)
      if (next.has(parent)) {
        next.delete(parent)
      } else {
        next.add(parent)
      }
      return next
    })
  }

  function toggleCategory(cat: string) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    onChange({ ...filters, categories: next })
  }

  const activeCount =
    filters.categories.length +
    (filters.search ? 1 : 0) +
    (Number.isFinite(filters.maxPrice) && filters.maxPrice < maxPrice ? 1 : 0)

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Filters
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="relative block">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products"
            className="border-border bg-background text-foreground focus:border-accent-violet placeholder:text-muted-foreground h-10 w-full rounded-md border pr-3 pl-9 text-sm transition-colors outline-none"
          />
        </label>
      </div>

      {/* Price slider */}
      {maxPrice > 0 && (
        <div>
          <h3 className="text-foreground text-xs font-semibold tracking-wide uppercase">
            Max Price
          </h3>
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={1}
            value={
              Number.isFinite(filters.maxPrice) ? filters.maxPrice : maxPrice
            }
            onChange={(e) =>
              onChange({ ...filters, maxPrice: Number(e.target.value) })
            }
            aria-label="Maximum price"
            className="accent-foreground mt-3 w-full"
          />
          <div className="text-muted-foreground mt-1.5 flex items-center justify-between text-xs tabular-nums">
            <span>{formatUSD(0)}</span>
            <span className="text-foreground font-medium">
              up to{" "}
              {formatUSD(
                Number.isFinite(filters.maxPrice) ? filters.maxPrice : maxPrice,
              )}
            </span>
          </div>
        </div>
      )}

      {/* Category accordion */}
      <div>
        <h3 className="text-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Category
        </h3>
        <ul className="flex flex-col gap-0.5">
          {CATEGORY_TREE.map(({ parent, children }) => {
            const isOpen = openParents.has(parent)
            const someChildChecked = children.some((c) =>
              filters.categories.includes(`${parent} > ${c}`),
            )

            return (
              <li key={parent}>
                <button
                  type="button"
                  onClick={() => toggleParentOpen(parent)}
                  className="hover:text-foreground flex w-full items-center justify-between rounded-md py-1.5 text-left text-sm transition-colors"
                >
                  <span
                    className={cn(
                      "font-medium",
                      someChildChecked
                        ? "text-accent-violet"
                        : "text-muted-foreground",
                    )}
                  >
                    {parent}
                  </span>
                  <ChevronDown
                    className={cn(
                      "text-muted-foreground h-3.5 w-3.5 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    strokeWidth={1.75}
                  />
                </button>

                {isOpen && (
                  <ul className="mt-0.5 ml-3 flex flex-col gap-0.5">
                    {children.map((child) => {
                      const key = `${parent} > ${child}`
                      const checked = filters.categories.includes(key)
                      return (
                        <li key={child}>
                          <button
                            type="button"
                            onClick={() => toggleCategory(key)}
                            className="hover:text-foreground flex w-full items-center gap-2.5 rounded-md py-1.5 text-left text-sm transition-colors"
                          >
                            <span
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                                checked
                                  ? "border-accent-violet bg-accent-violet text-white"
                                  : "border-border",
                              )}
                            >
                              {checked && (
                                <svg
                                  viewBox="0 0 12 12"
                                  className="h-3 w-3"
                                  fill="none"
                                >
                                  <path
                                    d="M2.5 6.5l2.5 2.5 4.5-5"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <span
                              className={cn(
                                checked
                                  ? "text-accent-violet font-medium"
                                  : "text-muted-foreground",
                              )}
                            >
                              {child}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
