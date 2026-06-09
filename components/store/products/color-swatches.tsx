"use client"

import { Check } from "lucide-react"
import type { ColorVariant } from "@/lib/catalog"
import { cn } from "@/lib/utils"

interface ColorSwatchesProps {
  variants: ColorVariant[]
  selectedId: string
  onSelect: (id: string) => void
}

export function ColorSwatches({ variants, selectedId, onSelect }: ColorSwatchesProps) {
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Tonality</span>
        <span className="text-sm text-muted-foreground">{selected?.name}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant.id)}
              aria-label={variant.name}
              aria-pressed={isSelected}
              title={variant.name}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "ring-2 ring-foreground"
                  : "ring-1 ring-border hover:ring-foreground/40",
              )}
            >
              <span
                className="h-7 w-7 rounded-full"
                style={{ backgroundColor: variant.hex }}
              />
              {isSelected && (
                <Check
                  className="absolute h-4 w-4 text-background mix-blend-difference"
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
