"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import type { CatalogCard, CatalogProduct } from "@/lib/catalog"
import { useProductPurchase } from "@/hooks/use-product-purchase"
import { HomeFooter } from "@/components/marketing/home-footer"
import { ProductGallery } from "./product-gallery"
import { ProductBuyPanel } from "./product-buy-panel"
import { RelatedProducts } from "./related-products"
import { StickyAddToCartBar } from "./sticky-add-to-cart-bar"

interface Props {
  product: CatalogProduct
  related: CatalogCard[]
}

export function ProductDetailPage({ product, related }: Props) {
  const purchase = useProductPurchase(product)
  const buyPanelRef = useRef<HTMLDivElement>(null)
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const el = buyPanelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const thumbnailUrl = purchase.galleryImages[0] ?? product.imageUrl ?? null

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <nav
          className="text-muted-foreground flex items-center gap-1.5 text-xs"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{product.nameEn}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery
            key={purchase.selectedVariationId}
            imageUrls={purchase.galleryImages}
            name={product.nameEn}
          />
          <div ref={buyPanelRef}>
            <ProductBuyPanel product={product} purchase={purchase} />
          </div>
        </div>

        <RelatedProducts related={related} />
      </div>
      <HomeFooter />
      <StickyAddToCartBar
        show={showSticky}
        name={product.nameEn}
        priceCents={purchase.priceCents}
        thumbnailUrl={thumbnailUrl}
        outOfStock={purchase.outOfStock}
        onAdd={purchase.handleAdd}
      />
    </>
  )
}
