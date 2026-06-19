/* eslint-disable @next/next/no-img-element */
"use client"

import { Plus } from "lucide-react"
import { MOCK_RELATED_PRODUCTS } from "@/lib/mock/cart"
import { formatUSD } from "@/lib/utils/format"
import type { Product } from "@/lib/types"
import { useCart } from "@/hooks/use-cart"

export function RelatedProducts() {
  return (
    <section className="mt-12">
      <h2 className="text-foreground text-lg font-semibold tracking-tight">
        You may also like
      </h2>

      <div className="mt-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {MOCK_RELATED_PRODUCTS.map((product) => (
          <RelatedCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function RelatedCard({ product }: { product: Product }) {
  const { addToCart } = useCart()

  return (
    <article className="group border-border bg-card relative w-[70%] shrink-0 snap-start overflow-hidden rounded-xl border sm:w-auto">
      <div className="bg-muted aspect-square overflow-hidden">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex items-end justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="text-foreground truncate text-sm font-medium">
            {product.name}
          </h3>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {product.variant}
          </p>
          <p className="text-foreground mt-1.5 text-sm font-semibold tabular-nums">
            {formatUSD(product.unitPrice)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.name} to cart`}
          className="bg-foreground text-background flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </article>
  )
}
