"use client"

import { Plus } from "lucide-react"
import { RELATED_PRODUCTS, formatUSD, type Product } from "@/lib/checkout"
import { useCart } from "../cart-context"

export function RelatedProducts() {
  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        You may also like
      </h2>

      {/* Mobile: horizontal snap carousel · Desktop: grid */}
      <div
        className="
          mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4
        "
      >
        {RELATED_PRODUCTS.map((product) => (
          <RelatedCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function RelatedCard({ product }: { product: Product }) {
  const { addToCart } = useCart()

  return (
    <article className="group relative w-[70%] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card sm:w-auto">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex items-end justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground">
            {product.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {product.variant}
          </p>
          <p className="mt-1.5 text-sm font-semibold text-foreground tabular-nums">
            {formatUSD(product.unitPrice)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.name} to cart`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </article>
  )
}
