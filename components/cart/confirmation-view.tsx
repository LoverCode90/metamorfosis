"use client"

import { useEffect } from "react"
import { Check, ShoppingBag, Info } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { PICKUP_ADDRESS, PICKUP_HOURS } from "@/lib/checkout/pickup"
import { PICKUP_WINDOW_DAYS } from "@/lib/orders/order-status-config"
import { CopyRow } from "./copy-row"
import { HomeFooter } from "@/components/marketing/home-footer"

export function ConfirmationView() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    // Push a dummy entry so the back button has somewhere to "go"
    window.history.pushState(null, "", window.location.href)

    function onPopState() {
      // User pressed back — redirect to home instead of letting them reach checkout
      window.history.pushState(null, "", window.location.href)
      router.replace("/")
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [router])
  const orderNumber = params.get("orderNumber")
  const orderId = params.get("orderId")
  const isPickup = params.get("pickup") === "1"

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
    <>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
        <div className="flex flex-col items-center text-center">
          <span className="bg-foreground text-background mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <Check className="h-8 w-8" strokeWidth={2} />
          </span>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
            {isPickup
              ? `Thanks for your order. Pick it up at our Ontario store within ${PICKUP_WINDOW_DAYS} calendar days during posted hours.`
              : "Thanks for your order. We'll email you a tracking number once your package ships."}
          </p>
        </div>

        <div className="border-accent-amber/40 bg-accent-amber/10 mx-auto mt-8 flex max-w-lg gap-3 rounded-xl border p-4 text-left">
          <Info className="text-accent-amber mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h3 className="text-accent-amber text-sm font-semibold">
              2-Hour Cancellation Window
            </h3>
            <p className="text-accent-amber/80 mt-1 text-sm">
              You have 2 hours to cancel this order. After that, cancellation is
              no longer available.
            </p>
          </div>
        </div>

        {isPickup && (
          <div className="border-border mx-auto mt-8 max-w-lg rounded-xl border p-5 text-left">
            <h3 className="text-foreground text-sm font-semibold">
              Store pickup
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              {PICKUP_ADDRESS}
            </p>
            <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
              {PICKUP_HOURS.map((line) => (
                <li key={line.days} className="flex justify-between gap-4">
                  <span>{line.days}</span>
                  <span className="text-foreground">{line.hours}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              Pick up within {PICKUP_WINDOW_DAYS} calendar days. Uncollected
              orders are automatically canceled and refunded.
            </p>
          </div>
        )}

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
            href="/orders"
            className="border-border text-foreground hover:bg-muted inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-medium transition-colors"
          >
            My Orders
          </Link>
        </div>
      </div>
      <HomeFooter />
    </>
  )
}
