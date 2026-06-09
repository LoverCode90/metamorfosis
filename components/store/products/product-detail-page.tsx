"use client"

import { useState } from "react"
import { ChevronRight, Minus, Plus, ShoppingBag, Heart, ShieldCheck, AlertTriangle } from "lucide-react"
import { getProduct, getRelated } from "@/lib/catalog"
import { formatUSD } from "@/lib/checkout"
import { useCart } from "../cart-context"
import { ProductGallery } from "./product-gallery"
import { ColorSwatches } from "./color-swatches"
import { ProductTabs } from "./product-tabs"
import { ProductCard } from "./product-card"

export function ProductDetailPage() {
  const { selectedProductId, setView, addToCart } = useCart()
  const product = selectedProductId ? getProduct(selectedProductId) : undefined

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
          onClick={() => setView("products")}
          className="mt-4 rounded-md bg-foreground px-5 py-2 text-sm font-semibold text-background"
        >
          Back to shop
        </button>
      </div>
    )
  }

  const item = product
  const finalPrice = item.unitPrice - item.discountPerItem
  const hasDiscount = item.discountPerItem > 0
  const lowStock = item.stock <= 10
  const related = getRelated(item.id)

  function handleAdd() {
    const colorName = item.colorVariants?.find((c) => c.id === selectedColor)?.name
    addToCart({ ...item, variant: colorName ?? item.variant }, qty)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <button type="button" onClick={() => setView("home")} className="hover:text-foreground">
          Home
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <button type="button" onClick={() => setView("products")} className="hover:text-foreground">
          Shop
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          image={product.image}
          name={product.name}
          badge={product.isProfessional ? "Professional" : product.isNew ? "New" : undefined}
        />

        <div className="flex flex-col">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand} · {product.category}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-foreground tabular-nums">
              {formatUSD(finalPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-muted-foreground line-through tabular-nums">
                  {formatUSD(product.unitPrice)}
                </span>
                <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-semibold text-background">
                  Save {formatUSD(product.discountPerItem)}
                </span>
              </>
            )}
          </div>

          <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Color products: tonality circles */}
          {product.type === "color" && product.colorVariants && (
            <div className="mt-6">
              <ColorSwatches
                variants={product.colorVariants}
                selectedId={selectedColor}
                onSelect={setSelectedColor}
              />
            </div>
          )}

          {/* Stock + pro flags */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {lowStock ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                In stock — ships in 1–2 days
              </span>
            )}
            {product.isProfessional && (
              <span className="text-muted-foreground">License verified at checkout</span>
            )}
          </div>

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="inline-flex h-12 items-center rounded-md border border-border">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-full w-12 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                disabled={qty <= 1}
              >
                <Minus className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
                className="flex h-full w-12 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                disabled={qty >= product.stock}
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2} />
              Add to Bag
            </button>

            <button
              type="button"
              aria-label="Add to wishlist"
              className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
            >
              <Heart className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      <ProductTabs product={product} />

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
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
