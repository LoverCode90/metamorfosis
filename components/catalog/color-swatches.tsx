"use client"

import { Check } from "lucide-react"
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
  const selected = variations.find((v) => v.id === selectedId) ?? variations[0]

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm font-medium">Tonality</span>
        <span className="text-muted-foreground text-sm">
          {selected?.shadeNumber ?? selected?.nameEn}
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
                "ring-offset-background focus-visible:ring-ring relative flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 transition-all focus-visible:ring-2 focus-visible:outline-none",
                isSelected
                  ? "ring-foreground ring-2"
                  : "ring-border hover:ring-foreground/40 ring-1",
              )}
            >
              <span
                className="h-7 w-7 rounded-full"
                style={{ backgroundColor: hex }}
              />
              {isSelected && (
                <Check
                  className="text-background absolute h-4 w-4 mix-blend-difference"
                  strokeWidth={3}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
