"use client"

import { memo } from "react"
import Link from "next/link"
import { Heart, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductCardMedia } from "@/components/catalog/product-card-media"
import { WishlistLoginModal } from "@/components/catalog/wishlist-login-modal"
import { useProductCard } from "@/hooks/use-product-card"
import { formatUSD } from "@/lib/utils/format"
import type { CatalogCard } from "@/lib/catalog"
import { cn } from "@/lib/utils"

/**
 * Catalog product card: image carousel, wishlist toggle, price, and an
 * add-to-bag / view-options action. State lives in {@link useProductCard}.
 * Memoized — rendered in catalog grids.
 */
export const ProductCard = memo(function ProductCard({
  product: card,
}: {
  product: CatalogCard
}) {
  const {
    wishlisted,
    lowStock,
    outOfStock,
    hasOptions,
    images,
    showWishlistModal,
    setShowWishlistModal,
    handleAdd,
    handleWishlist,
  } = useProductCard(card)

  const href = `/products/${card.squareProductId}`
  const wishlistClass = cn(
    "absolute top-2.5 right-2.5 z-10 h-8 w-8 rounded-full backdrop-blur",
    wishlisted
      ? "bg-foreground text-background"
      : "bg-black/60 text-white shadow-md hover:bg-black/80",
  )

  return (
    <>
      <article className="group relative flex h-full flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleWishlist}
          aria-label={
            wishlisted
              ? `Remove ${card.nameEn} from wishlist`
              : `Save ${card.nameEn} to wishlist`
          }
          aria-pressed={wishlisted}
          className={wishlistClass}
        >
          <Heart
            className="h-4 w-4"
            strokeWidth={1.75}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </Button>

        <ProductCardMedia
          images={images}
          href={href}
          alt={card.nameEn}
          isPro={card.isProfessional}
          lowStock={lowStock}
          outOfStock={outOfStock}
        />

        <div className="flex flex-1 flex-col pt-3">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {card.categoriesHierarchy.split(" > ")[0]}
          </p>
          <Link
            href={href}
            className="text-foreground mt-1 text-left text-sm leading-snug font-medium hover:underline"
          >
            {card.nameEn}
          </Link>

          <div className="mt-auto flex flex-col items-stretch gap-2 pt-3 sm:flex-row sm:items-end sm:justify-between">
            <span className="text-foreground text-sm font-semibold tabular-nums">
              {outOfStock ? (
                <span className="text-muted-foreground text-xs">
                  Out of stock
                </span>
              ) : (
                `From ${formatUSD(card.minPriceCents)}`
              )}
            </span>

            {hasOptions ? (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                aria-disabled={outOfStock}
                className={cn(
                  "shrink-0",
                  outOfStock && "pointer-events-none opacity-40",
                )}
                render={<Link href={href} />}
              >
                View Options
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={outOfStock}
                className="shrink-0"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                Add to Bag
              </Button>
            )}
          </div>
        </div>
      </article>

      <WishlistLoginModal
        open={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
      />
    </>
  )
})
