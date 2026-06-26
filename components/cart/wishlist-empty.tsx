import Link from "next/link"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { WishlistPageHeader } from "@/components/cart/wishlist-page-header"

/** Empty-state shown when the user has no saved wishlist items. */
export function WishlistEmpty() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <WishlistPageHeader count={0} />
      <div className="border-border mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center">
        <span className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
          <Heart className="text-muted-foreground h-6 w-6" strokeWidth={1.5} />
        </span>
        <p className="text-foreground mt-5 text-base font-semibold">
          Your wishlist is empty
        </p>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
          Tap the heart on any product to save it here for later.
        </p>
        <Button size="cta" className="mt-6" render={<Link href="/products" />}>
          Browse products
        </Button>
      </div>
    </div>
  )
}
