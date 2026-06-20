/* eslint-disable @next/next/no-img-element */
"use client"

import { useMemo, useState } from "react"
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react"
import Link from "next/link"
import { formatUSD } from "@/lib/utils/format"
import { squareImageUrl } from "@/lib/utils/square-image"
import { cn } from "@/lib/utils"
import {
  LOW_STOCK_THRESHOLD,
  type CatalogProduct,
  type CatalogVariation,
} from "@/lib/catalog"
import { useCart } from "@/hooks/use-cart"
import { PlaceholderImage } from "@/components/shared/placeholder-image"
import { ColorSwatches } from "./color-swatches"
import type { CatalogCard } from "@/lib/catalog"
import { ProductCard } from "./product-card"

interface Props {
  product: CatalogProduct
  related: CatalogCard[]
}

export function ProductDetailPage({ product, related }: Props) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart()

  const colorVariations = product.variations.filter((v) => v.hexColor)
  const sizeVariations = product.variations.filter((v) => !v.hexColor)

  const [qty, setQty] = useState(1)
  const [selectedVariationId, setSelectedVariationId] = useState(
    product.variations[0]?.id ?? "",
  )
  // Gallery state: tracks both which variation is "active" and the selected thumb index.
  // Storing the variationId alongside idx allows us to auto-reset to 0 when the
  // variation changes without needing a separate useEffect.
  const [galleryState, setGalleryState] = useState({
    variationId: selectedVariationId,
    idx: 0,
  })
  const galleryIdx =
    galleryState.variationId === selectedVariationId ? galleryState.idx : 0

  const selectedVariation: CatalogVariation | undefined =
    product.variations.find((v) => v.id === selectedVariationId) ??
    product.variations[0]

  const stock = selectedVariation?.inventoryCount ?? 0
  const lowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD
  const outOfStock = stock === 0
  const priceCents = selectedVariation?.priceCents ?? product.minPriceCents
  const wishlisted = isWishlisted(product.squareProductId)

  // Build gallery: variation image first (if unique), then parent images
  const galleryImages = useMemo(() => {
    const varImg = selectedVariation?.imageUrl ?? null
    const parentImgs =
      product.imageUrls.length > 0
        ? product.imageUrls
        : product.imageUrl
          ? [product.imageUrl]
          : []
    if (varImg) {
      const rest = parentImgs.filter((u) => u !== varImg)
      return [varImg, ...rest]
    }
    return parentImgs
  }, [selectedVariation, product.imageUrls, product.imageUrl])

  const mainImgSrc = squareImageUrl(galleryImages[galleryIdx] ?? null, 1200)
  // rawImageUrl is used for cart thumbnail — always the variation's own image
  const rawImageUrl = selectedVariation?.imageUrl ?? product.imageUrl ?? null

  function handleAdd() {
    addToCart(
      {
        id: product.squareProductId,
        name: product.nameEn,
        variant:
          selectedVariation?.shadeNumber ??
          selectedVariation?.sizeLabel ??
          selectedVariation?.nameEn ??
          "",
        image: rawImageUrl ?? "",
        unitPrice: priceCents,
        discountPerItem: 0,
        stock,
        isProfessional: product.isProfessional,
      },
      qty,
    )
  }

  function handleWishlist() {
    toggleWishlist({
      id: product.squareProductId,
      name: product.nameEn,
      variant: selectedVariation?.nameEn ?? "",
      image: rawImageUrl ?? "",
      unitPrice: priceCents,
      discountPerItem: 0,
      stock,
      isProfessional: product.isProfessional,
    })
  }

  return (
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
        {/* ── Gallery ── */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square overflow-hidden rounded-2xl">
            {mainImgSrc ? (
              <img
                src={mainImgSrc}
                alt={product.nameEn}
                loading="eager"
                className="h-full w-full object-cover transition-opacity duration-200"
              />
            ) : (
              <PlaceholderImage className="h-full w-full rounded-2xl" />
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {galleryImages.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setGalleryState({
                      variationId: selectedVariationId,
                      idx: i,
                    })
                  }
                  aria-label={`Image ${i + 1}`}
                  className={cn(
                    "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150",
                    i === galleryIdx
                      ? "border-accent-violet opacity-100"
                      : "border-transparent opacity-60 hover:opacity-90",
                  )}
                >
                  <img
                    src={squareImageUrl(url, 160) ?? "/placeholder.svg"}
                    alt={`${product.nameEn} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ── */}
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

          {/* Size selector */}
          {!product.isColorProduct && sizeVariations.length > 1 && (
            <div>
              <p className="text-foreground mb-3 text-sm font-medium">Size</p>
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
                    {v.sizeLabel ?? v.nameEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color chart PDFs */}
          {product.colorChartPdfUrl && (
            <div className="flex gap-3">
              <a
                href={product.colorChartPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors lg:text-sm"
              >
                <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
                View Chart
              </a>
              <a
                href={product.colorChartPdfUrl}
                download
                className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors lg:text-sm"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                Download Chart
              </a>
            </div>
          )}

          {/* Color disclaimer */}
          {product.isColorProduct && (
            <p className="text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 text-xs leading-relaxed lg:text-sm">
              Shades shown are a digital approximation. For accurate
              formulation, consult the printed chart or a licensed professional.
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
              aria-label={
                wishlisted ? "Remove from wishlist" : "Save to wishlist"
              }
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
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            You may also like
          </h2>
          <div className="mt-6 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4 lg:gap-x-6 [&::-webkit-scrollbar]:hidden">
            {related.map((card) => (
              <div
                key={card.squareProductId}
                className="w-[70%] shrink-0 snap-start sm:w-auto"
              >
                <ProductCard product={card} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
