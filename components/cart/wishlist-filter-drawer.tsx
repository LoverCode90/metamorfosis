"use client"

import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { WishlistFilterSidebar } from "@/components/cart/wishlist-filters"

interface WishlistFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Number of items currently shown, surfaced on the apply button. */
  resultCount: number
  /** Props forwarded to the shared filter sidebar. */
  filters: ComponentProps<typeof WishlistFilterSidebar>
}

/** Bottom sheet exposing the wishlist filters on small screens. */
export function WishlistFilterDrawer({
  open,
  onOpenChange,
  resultCount,
  filters,
}: WishlistFilterDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl lg:hidden">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="px-5">
          <WishlistFilterSidebar {...filters} />
        </div>
        <SheetFooter>
          <Button
            size="lg"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Show {resultCount} {resultCount === 1 ? "item" : "items"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
