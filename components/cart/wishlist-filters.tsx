"use client"

import { cn } from "@/lib/utils"

export function WishlistFilterSidebar({
  brands,
  selectedBrands,
  onBrandToggle,
  onClear,
  activeCount,
}: {
  brands: { name: string; count: number }[]
  selectedBrands: Set<string>
  onBrandToggle: (b: string) => void
  onClear: () => void
  activeCount: number
}) {
  return (
    <aside className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm font-semibold">Filters</span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground text-xs font-medium underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>

      {brands.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
                      className="border-border accent-foreground h-4 w-4 rounded"
                    />
                    <span
                      className={cn(
                        "flex-1",
                        checked ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {name}
                    </span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {count}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </aside>
  )
}
