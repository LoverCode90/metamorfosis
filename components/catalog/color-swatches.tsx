"use client"

import { useMemo } from "react"

import type { CatalogVariation } from "@/lib/catalog"
import { cn } from "@/lib/utils"

interface ColorSwatchesProps {
  variations: CatalogVariation[]
  selectedId: string
  onSelect: (id: string) => void
}

export function ColorSwatches({
  variations,
  selectedId,
  onSelect,
}: ColorSwatchesProps) {
  // Build a lookup map once so selecting a swatch is an O(1) read.
  const variationMap = useMemo(
    () => new Map(variations.map((variation) => [variation.id, variation])),
    [variations],
  )
  const selectedVariation = variationMap.get(selectedId) ?? variations[0]

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm font-medium">Tonality</span>
        <span className="text-muted-foreground text-sm">
          {selectedVariation?.shadeNumber ?? selectedVariation?.nameEn}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {variations.map((variation) => {
          const isSelected = variation.id === selectedId
          const hex = variation.hexColor ?? "#888888"
          return (
            <button
              key={variation.id}
              type="button"
              onClick={() => onSelect(variation.id)}
              aria-label={variation.shadeNumber ?? variation.nameEn}
              aria-pressed={isSelected}
              title={variation.shadeNumber ?? variation.nameEn}
              className={cn(
                "ring-offset-background focus-visible:ring-ring relative flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 transition-all focus-visible:ring-2 focus-visible:outline-none",
                isSelected
                  ? "ring-2 ring-white"
                  : "ring-border hover:ring-foreground/40 ring-1",
              )}
            >
              <span
                className="h-6 w-6 rounded-full"
                style={{ backgroundColor: hex }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
