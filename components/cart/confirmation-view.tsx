"use client"

import { Check, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CopyRow } from "./copy-row"

export function ConfirmationView() {
  const router = useRouter()
  const params = useSearchParams()
  const orderNumber = params.get("orderNumber")
  const orderId = params.get("orderId")

  if (!orderNumber) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-muted-foreground text-sm">No recent order found.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-foreground text-background mt-4 h-11 rounded-md px-6 text-sm font-semibold"
        >
          Back to home
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <div className="flex flex-col items-center text-center">
        <span className="bg-foreground text-background mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <Check className="h-8 w-8" strokeWidth={2} />
        </span>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
          Thanks for your order. We{"'"}ll email you a tracking number once your
          package ships.
        </p>
      </div>

      <div className="border-border mt-10 rounded-xl border p-6">
        <h2 className="text-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
          Order Details
        </h2>
        <dl className="space-y-3 text-sm">
          <CopyRow label="Order number" value={orderNumber} />
          {orderId && <CopyRow label="Order ID" value={orderId} />}
        </dl>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/products"
          className="bg-foreground text-background inline-flex h-11 items-center justify-center gap-2 rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
          Continue Shopping
        </Link>
        <Link
          href="/profile"
          className="border-border text-foreground hover:bg-muted inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-medium transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}
