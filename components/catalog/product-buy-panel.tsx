"use client"

import { AlertTriangle, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ColorSwatches } from "@/components/catalog/color-swatches"
import { ProductBuyActions } from "@/components/catalog/product-buy-actions"
import { ProductColorCharts } from "@/components/catalog/product-color-charts"
import { ProductVariantSelector } from "@/components/catalog/product-variant-selector"
import { formatUSD } from "@/lib/utils/format"
import type { CatalogProduct } from "@/lib/catalog"
import type { ProductPurchase } from "@/hooks/use-product-purchase"

interface Props {
  product: CatalogProduct
  purchase: ProductPurchase
}

/**
 * Product detail buy panel: title, price, variant/color selection, stock, and
 * the add-to-bag actions. Presentational — all state comes from
 * {@link useProductPurchase} via `purchase`.
 */
export function ProductBuyPanel({ product, purchase }: Props) {
  const {
    qty,
    setQty,
    selectedVariationId,
    setSelectedVariationId,
    stock,
    lowStock,
    outOfStock,
    priceCents,
    wishlisted,
    colorVariations,
    sizeVariations,
    pdfUrl,
    handleAdd,
    handleWishlist,
  } = purchase

  const showVariantSelector =
    (!product.isColorProduct && sizeVariations.length > 1) ||
    (product.isColorProduct &&
      colorVariations.length === 0 &&
      sizeVariations.length > 0)

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase lg:text-sm">
          {product.categoriesHierarchy.split(" > ")[0]}
        </p>
        <h1 className="text-foreground mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {product.nameEn}
        </h1>
        {product.isProfessional && (
          <Badge variant="warning" className="mt-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            Professional Only
          </Badge>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-foreground text-2xl font-bold tabular-nums">
          {formatUSD(priceCents)}
        </span>
        {!product.isReturnable && (
          <span className="text-muted-foreground text-sm lg:text-sm">
            Final sale
          </span>
        )}
      </div>

      {product.descriptionEn && (
        <p className="text-muted-foreground hidden text-sm leading-relaxed lg:block lg:text-base">
          {product.descriptionEn}
        </p>
      )}

      {product.isColorProduct && colorVariations.length > 0 && (
        <ColorSwatches
          variations={colorVariations}
          selectedId={selectedVariationId}
          onSelect={setSelectedVariationId}
        />
      )}

      {showVariantSelector && (
        <ProductVariantSelector
          variations={sizeVariations}
          selectedId={selectedVariationId}
          onSelect={setSelectedVariationId}
          isColorProduct={product.isColorProduct}
        />
      )}

      {pdfUrl && <ProductColorCharts pdfUrl={pdfUrl} />}

      <p className="text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 text-xs leading-relaxed lg:text-sm">
        Chemical products (bleach, developer, permanent color) cannot be
        returned once shipped.
      </p>

      {outOfStock ? (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
          Out of stock
        </div>
      ) : lowStock ? (
        <div className="flex items-center gap-2 text-sm text-amber-400">
          <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
          Only {stock} left
        </div>
      ) : null}

      <ProductBuyActions
        qty={qty}
        stock={stock}
        outOfStock={outOfStock}
        onQtyChange={setQty}
        wishlisted={wishlisted}
        onAdd={handleAdd}
        onWishlist={handleWishlist}
      />

      {product.descriptionEn && (
        <p className="text-muted-foreground text-sm leading-relaxed lg:hidden">
          {product.descriptionEn}
        </p>
      )}
    </div>
  )
}
