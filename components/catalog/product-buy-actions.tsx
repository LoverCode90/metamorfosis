"use client"

import { Heart, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductQuantityStepper } from "@/components/catalog/product-quantity-stepper"
import { cn } from "@/lib/utils"

interface ProductBuyActionsProps {
  qty: number
  stock: number
  outOfStock: boolean
  onQtyChange: (n: number) => void
  wishlisted: boolean
  onAdd: () => void
  onWishlist: () => void
}

/** Quantity stepper, add-to-bag CTA, and wishlist toggle row. */
export function ProductBuyActions({
  qty,
  stock,
  outOfStock,
  onQtyChange,
  wishlisted,
  onAdd,
  onWishlist,
}: ProductBuyActionsProps) {
  const wishlistClass = cn(
    "h-11 w-11",
    wishlisted && "border-foreground bg-foreground text-background",
  )

  return (
    <div className="flex items-center gap-3">
      <ProductQuantityStepper
        value={qty}
        min={1}
        max={stock || 99}
        disabled={outOfStock}
        onChange={onQtyChange}
      />

      <Button
        variant="accent"
        onClick={onAdd}
        disabled={outOfStock}
        className="h-11 flex-1"
      >
        <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
        {outOfStock ? "Out of stock" : "Add to Bag"}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onWishlist}
        aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={wishlisted}
        className={wishlistClass}
      >
        <Heart
          className="h-4 w-4"
          strokeWidth={1.75}
          fill={wishlisted ? "currentColor" : "none"}
        />
      </Button>
    </div>
  )
}
