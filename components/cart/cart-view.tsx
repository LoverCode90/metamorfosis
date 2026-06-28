"use client"

import { useState } from "react"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { CartLineItem } from "./cart-line-item"
import { CartSummary } from "./cart-summary"
import { VerifyGateModal } from "@/components/profile/verify-gate-modal"

export function CartView() {
  const router = useRouter()
  const { items, totals, hasProItems } = useCart()
  const [gateOpen, setGateOpen] = useState(false)
  const isEmpty = items.length === 0

  function handleCheckout() {
    if (hasProItems) {
      setGateOpen(true)
      return
    }
    router.push("/checkout")
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <VerifyGateModal open={gateOpen} onClose={() => setGateOpen(false)} />

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          My Cart
        </h1>
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Continue Shopping
        </button>
      </div>

      {isEmpty ? (
        <EmptyCart onShop={() => router.push("/products")} />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div className="order-2 flex flex-col gap-4 lg:order-1">
            {items.map((item) => (
              <CartLineItem key={item.id} item={item} />
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <CartSummary
              totals={totals}
              onCheckout={handleCheckout}
              onContinueShopping={() => router.push("/products")}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyCart({ onShop }: { onShop: () => void }) {
  return (
    <div className="border-border bg-card mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-20 text-center">
      <span className="bg-muted text-muted-foreground flex h-14 w-14 items-center justify-center rounded-full">
        <ShoppingBag className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h2 className="text-foreground mt-5 text-lg font-semibold">
        Your cart is empty
      </h2>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
        Add a few Metamorfosis LLC essentials to get started.
      </p>
      <button
        type="button"
        onClick={onShop}
        className="bg-accent-violet mt-6 h-11 rounded-md px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Browse products
      </button>
    </div>
  )
}
