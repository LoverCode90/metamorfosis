"use client"

import { Check } from "lucide-react"
import type { ColorVariant } from "@/lib/catalog"
import { cn } from "@/lib/utils"

interface ColorSwatchesProps {
  variants: ColorVariant[]
  selectedId: string
  onSelect: (id: string) => void
}

export function ColorSwatches({
  variants,
  selectedId,
  onSelect,
}: ColorSwatchesProps) {
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm font-medium">Tonality</span>
        <span className="text-muted-foreground text-sm">{selected?.name}</span>
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
                "ring-offset-background focus-visible:ring-ring relative flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 transition-all focus-visible:ring-2 focus-visible:outline-none",
                isSelected
                  ? "ring-foreground ring-2"
                  : "ring-border hover:ring-foreground/40 ring-1",
              )}
            >
              <span
                className="h-7 w-7 rounded-full"
                style={{ backgroundColor: variant.hex }}
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
