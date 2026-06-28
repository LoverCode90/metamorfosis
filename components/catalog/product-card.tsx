"use client"

import { memo } from "react"
import Link from "next/link"

import { ProductCardMedia } from "@/components/catalog/product-card-media"
import { AddToCartButton } from "@/components/catalog/add-to-cart-button"
import { QuickViewModal } from "@/components/catalog/quick-view-modal"
import { useProductCard } from "@/hooks/use-product-card"
import { formatUSD } from "@/lib/utils/format"
import type { CatalogCard } from "@/lib/catalog"

export const ProductCard = memo(function ProductCard({
  product: card,
}: {
  product: CatalogCard
}) {
  const {
    lowStock,
    outOfStock,
    images,
    showQuickView,
    setShowQuickView,
    handleCartClick,
  } = useProductCard(card)

  const href = `/products/${card.squareProductId}`

  return (
    <>
      <article className="group relative flex flex-col">
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
            className="text-foreground text-xs leading-snug font-medium hover:underline sm:text-sm"
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

      <QuickViewModal
        open={showQuickView}
        onClose={() => setShowQuickView(false)}
        card={card}
      />
    </>
  )
})
