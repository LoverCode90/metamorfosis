"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import type { CatalogCard, CatalogProduct } from "@/lib/catalog"
import { useProductPurchase } from "@/hooks/use-product-purchase"
import { HomeFooter } from "@/components/marketing/home-footer"
import { ProductGallery } from "./product-gallery"
import { ProductBuyPanel } from "./product-buy-panel"
import { RelatedProducts } from "./related-products"

interface Props {
  product: CatalogProduct
  related: CatalogCard[]
}

export function ProductDetailPage({ product, related }: Props) {
  const purchase = useProductPurchase(product)

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
          <ProductBuyPanel product={product} purchase={purchase} />
        </div>

        <RelatedProducts related={related} />
      </div>
      <HomeFooter />
    </>
  )
}
