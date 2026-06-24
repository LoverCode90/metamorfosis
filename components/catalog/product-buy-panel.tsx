"use client"

import {
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import type { CatalogProduct } from "@/lib/catalog"
import type { ProductPurchase } from "@/hooks/use-product-purchase"
import { ColorSwatches } from "./color-swatches"

interface Props {
  product: CatalogProduct
  purchase: ProductPurchase
}

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase lg:text-sm">
          {product.categoriesHierarchy.split(" > ")[0]}
        </p>
        <h1 className="text-foreground mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {product.nameEn}
        </h1>

        {product.isProfessional && (
          <span className="border-accent-amber/30 bg-accent-amber/10 text-accent-amber mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Professional Only
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-foreground text-2xl font-bold tabular-nums">
          {formatUSD(priceCents)}
        </span>
        {!product.isReturnable && (
          <span className="text-muted-foreground text-xs lg:text-sm">
            Final sale
          </span>
        )}
      </div>

      {/* Description — desktop only */}
      {product.descriptionEn && (
        <p className="text-muted-foreground hidden text-sm leading-relaxed lg:block lg:text-base">
          {product.descriptionEn}
        </p>
      )}

      {/* Color swatches */}
      {product.isColorProduct && colorVariations.length > 0 && (
        <ColorSwatches
          variations={colorVariations}
          selectedId={selectedVariationId}
          onSelect={setSelectedVariationId}
        />
      )}

      {/* Variant selector (Size or Shade name) */}
      {((!product.isColorProduct && sizeVariations.length > 1) ||
        (product.isColorProduct &&
          colorVariations.length === 0 &&
          sizeVariations.length > 0)) && (
        <div>
          <p className="text-foreground mb-3 text-sm font-medium">
            {product.isColorProduct ? "Shade" : "Size"}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizeVariations.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariationId(v.id)}
                className={cn(
                  "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                  selectedVariationId === v.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:bg-muted",
                )}
              >
                {product.isColorProduct
                  ? v.shadeNumber || v.nameEn
                  : (v.sizeLabel ?? v.nameEn)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color chart PDFs */}
      {pdfUrl && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <a
              href={`/color-charts/${pdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors lg:text-sm"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
              View Chart
            </a>
            <a
              href={`/color-charts/${pdfUrl}`}
              download
              className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors lg:text-sm"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              Download Chart
            </a>
          </div>
          <p className="border-accent-violet/30 bg-accent-violet/10 text-accent-violet rounded-lg border px-4 py-2.5 text-xs font-medium lg:text-sm">
            We recommend viewing the color chart to see accurate shades.
          </p>
        </div>
      )}

      {/* Color disclaimer */}
      {product.isColorProduct && (
        <p className="text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 text-xs leading-relaxed lg:text-sm">
          Shades shown are a digital approximation. For accurate formulation,
          consult the printed chart or a licensed professional.
        </p>
      )}

      {/* Stock status */}
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

      {/* Qty + Add */}
      <div className="flex items-center gap-3">
        <div className="border-border flex items-center rounded-md border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="text-foreground hover:bg-muted flex h-10 w-10 items-center justify-center transition-colors disabled:opacity-30"
          >
            <Minus className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <span className="text-foreground w-8 text-center text-sm font-semibold tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock || 99, q + 1))}
            disabled={outOfStock || qty >= (stock || 99)}
            aria-label="Increase quantity"
            className="text-foreground hover:bg-muted flex h-10 w-10 items-center justify-center transition-colors disabled:opacity-30"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="bg-accent-violet focus-visible:ring-ring flex h-11 flex-1 items-center justify-center gap-2 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
          {outOfStock ? "Out of stock" : "Add to Bag"}
        </button>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wishlisted}
          className={cn(
            "border-border flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition-colors",
            wishlisted
              ? "border-foreground bg-foreground text-background"
              : "text-foreground hover:bg-muted",
          )}
        >
          <Heart
            className="h-4 w-4"
            strokeWidth={1.75}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Return policy note */}
      {!product.isReturnable && (
        <p className="text-muted-foreground text-xs lg:text-sm">
          Chemical products (bleach, developer, permanent color) cannot be
          returned once shipped.
        </p>
      )}

      {/* Description — mobile only */}
      {product.descriptionEn && (
        <p className="text-muted-foreground text-sm leading-relaxed lg:hidden">
          {product.descriptionEn}
        </p>
      )}
    </div>
  )
}
