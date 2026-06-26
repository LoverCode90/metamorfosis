"use client"

import { Button } from "@/components/ui/button"
import type { CatalogVariation } from "@/lib/catalog"

interface ProductVariantSelectorProps {
  variations: CatalogVariation[]
  selectedId: string
  onSelect: (id: string) => void
  /** Color products label as "Shade" and show the shade number. */
  isColorProduct: boolean
}

/** Size/shade variant chooser rendered as a button group. */
export function ProductVariantSelector({
  variations,
  selectedId,
  onSelect,
  isColorProduct,
}: ProductVariantSelectorProps) {
  return (
    <div>
      <p className="text-foreground mb-3 text-sm font-medium">
        {isColorProduct ? "Shade" : "Size"}
      </p>
      <div className="flex flex-wrap gap-2">
        {variations.map((variation) => (
          <Button
            key={variation.id}
            type="button"
            variant={selectedId === variation.id ? "default" : "outline"}
            onClick={() => onSelect(variation.id)}
          >
            {isColorProduct
              ? variation.shadeNumber || variation.nameEn
              : (variation.sizeLabel ?? variation.nameEn)}
          </Button>
        ))}
      </div>
    </div>
  )
}
