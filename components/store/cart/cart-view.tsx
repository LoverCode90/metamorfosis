"use client"

import { ArrowLeft, ShoppingBag } from "lucide-react"
import { useCart } from "../cart-context"
import { CartLineItem } from "./cart-line-item"
import { CartSummary } from "./cart-summary"
import { RelatedProducts } from "./related-products"

export function CartView() {
  const { items, totals, setView } = useCart()
  const isEmpty = items.length === 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          My Cart
        </h1>
        <button
          type="button"
          onClick={() => setView("home")}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Continue Shopping
        </button>
      </div>

      {isEmpty ? (
        <EmptyCart onShop={() => setView("home")} />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* Items — stack order */}
          <div className="order-2 flex flex-col gap-4 lg:order-1">
            {items.map((item) => (
              <CartLineItem key={item.id} item={item} />
            ))}
          </div>

          {/* Summary — sticky on desktop, stacks last on mobile */}
          <div className="order-1 lg:order-2">
            <CartSummary
              totals={totals}
              onCheckout={() => setView("checkout")}
              onContinueShopping={() => setView("home")}
            />
          </div>
        </div>
      )}

      {/* Cross-sell */}
      <RelatedProducts />
    </div>
  )
}

function EmptyCart({ onShop }: { onShop: () => void }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ShoppingBag className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-foreground">
        Your cart is empty
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Add a few Metamorfosis Lab essentials to get started.
      </p>
      <button
        type="button"
        onClick={onShop}
        className="mt-6 h-11 rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        Browse products
      </button>
    </div>
  )
}
