"use client"

import { useState } from "react"
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
  Info,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getProduct, getRelated } from "@/lib/catalog"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { ProductGallery } from "./product-gallery"
import { ColorSwatches } from "./color-swatches"
import { ProductTabs } from "./product-tabs"
import { ProductCard } from "./product-card"

interface Props {
  id: string
}

export function ProductDetailPage({ id }: Props) {
  const router = useRouter()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const product = getProduct(id)

  const [qty, setQty] = useState(1)
  const [selectedColor, setSelectedColor] = useState(
    product?.colorVariants?.[0]?.id ?? "",
  )

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="bg-foreground text-background mt-4 rounded-md px-5 py-2 text-sm font-semibold"
        >
          Back to shop
        </button>
      </div>
    )
  }

  const finalPrice = product.unitPrice - product.discountPerItem
  const hasDiscount = product.discountPerItem > 0
  const lowStock = product.stock <= 10
  const related = getRelated(product.id)
  const wishlisted = isWishlisted(product.id)

  function handleAdd() {
    if (!product) return
    const colorName = product.colorVariants?.find(
      (c) => c.id === selectedColor,
    )?.name
    addToCart(
      { ...product, id: product.id, variant: colorName ?? product.variant },
      qty,
    )
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
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          image={product.image}
          name={product.name}
          badge={
            product.isProfessional
              ? "Professional"
              : product.isNew
                ? "New"
                : undefined
          }
        />

        <div className="flex flex-col">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {product.brand} · {product.category}
          </p>
          <h1 className="text-foreground mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-foreground text-2xl font-semibold tabular-nums">
              {formatUSD(finalPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-muted-foreground text-base tabular-nums line-through">
                  {formatUSD(product.unitPrice)}
                </span>
                <span className="bg-foreground text-background rounded-full px-2 py-0.5 text-xs font-semibold">
                  Save {formatUSD(product.discountPerItem)}
                </span>
              </>
            )}
          </div>

          <p className="text-muted-foreground mt-5 max-w-prose text-sm leading-relaxed">
            {product.description}
          </p>

          {product.type === "color" && product.colorVariants && (
            <div className="mt-6">
              <ColorSwatches
                variants={product.colorVariants}
                selectedId={selectedColor}
                onSelect={setSelectedColor}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/color-charts/bbcos-permanent-color.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border text-foreground hover:bg-muted inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors"
                >
                  <FileText className="h-4 w-4" strokeWidth={1.75} />
                  Open color chart
                </a>
                <a
                  href="/color-charts/bbcos-permanent-color.pdf"
                  download
                  className="border-border text-foreground hover:bg-muted inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" strokeWidth={1.75} />
                  Download PDF
                </a>
              </div>

              <div className="border-border bg-muted mt-4 flex items-start gap-2.5 rounded-lg border px-4 py-3">
                <Info
                  className="text-foreground mt-0.5 h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Shades shown are a digital approximation. For accurate
                  formulation and developer ratios, consult the printed chart or
                  a licensed professional before application.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {lowStock ? (
              <span className="text-foreground inline-flex items-center gap-1.5 font-medium">
                <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                In stock — ships in 1–2 days
              </span>
            )}
            {product.isProfessional && (
              <span className="text-muted-foreground">
                License verified at checkout
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="border-border inline-flex h-12 items-center rounded-md border">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="text-foreground hover:bg-muted flex h-full w-12 items-center justify-center transition-colors disabled:opacity-40"
                disabled={qty <= 1}
              >
                <Minus className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
                className="text-foreground hover:bg-muted flex h-full w-12 items-center justify-center transition-colors disabled:opacity-40"
                disabled={qty >= product.stock}
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="bg-foreground text-background focus-visible:ring-ring inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2} />
              Add to Bag
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label={
                wishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              aria-pressed={wishlisted}
              className={cn(
                "inline-flex h-12 w-12 items-center justify-center rounded-md border transition-colors",
                wishlisted
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground hover:bg-muted",
              )}
            >
              <Heart
                className="h-5 w-5"
                strokeWidth={1.75}
                fill={wishlisted ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </div>

      <ProductTabs product={product} />

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            You may also like
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
