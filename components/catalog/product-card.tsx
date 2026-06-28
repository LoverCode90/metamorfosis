"use client"

import { memo } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"

import { ProductCardMedia } from "@/components/catalog/product-card-media"
import { WishlistLoginModal } from "@/components/catalog/wishlist-login-modal"
import { AddToCartButton } from "@/components/catalog/add-to-cart-button"
import { QuickViewModal } from "@/components/catalog/quick-view-modal"
import { useProductCard } from "@/hooks/use-product-card"
import { formatUSD } from "@/lib/utils/format"
import type { CatalogCard } from "@/lib/catalog"
import { cn } from "@/lib/utils"

export const ProductCard = memo(function ProductCard({
  product: card,
}: {
  product: CatalogCard
}) {
  const {
    wishlisted,
    lowStock,
    outOfStock,
    images,
    showWishlistModal,
    setShowWishlistModal,
    showQuickView,
    setShowQuickView,
    handleCartClick,
    handleWishlist,
  } = useProductCard(card)

  const href = `/products/${card.squareProductId}`

  return (
    <>
      <article className="group relative flex flex-col">
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={
            wishlisted
              ? `Remove ${card.nameEn} from wishlist`
              : `Save ${card.nameEn} to wishlist`
          }
          aria-pressed={wishlisted}
          className={cn(
            "absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-colors",
            wishlisted
              ? "bg-foreground text-background"
              : "bg-black/60 text-white shadow-md hover:bg-black/80",
          )}
        >
          <Heart
            className="h-4 w-4"
            strokeWidth={1.75}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>

        <div className="relative">
          <ProductCardMedia
            images={images}
            href={href}
            alt={card.nameEn}
            isPro={card.isProfessional}
            lowStock={lowStock}
            outOfStock={outOfStock}
          />
          <AddToCartButton
            outOfStock={outOfStock}
            onClick={handleCartClick}
            className="absolute right-3 bottom-3 z-10 translate-y-0 opacity-100 transition-all duration-200 lg:translate-y-1 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
          />
        </div>

        <div className="flex flex-col gap-0.5 pt-3">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {card.categoriesHierarchy.split(" > ")[0]}
          </p>
          <Link
            href={href}
            className="text-foreground text-sm leading-snug font-medium hover:underline"
          >
            {card.nameEn}
          </Link>
          <span className="text-foreground text-sm font-semibold tabular-nums">
            {outOfStock ? (
              <span className="text-muted-foreground text-xs">
                Out of stock
              </span>
            ) : (
              `From ${formatUSD(card.minPriceCents)}`
            )}
          </span>
        </div>
      </article>

      <WishlistLoginModal
        open={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
      />
      <QuickViewModal
        open={showQuickView}
        onClose={() => setShowQuickView(false)}
        card={card}
      />
    </>
  )
})
