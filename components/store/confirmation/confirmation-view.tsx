"use client"

import { Check, Mail, MapPin, ShoppingBag, Truck } from "lucide-react"
import { formatUSD } from "@/lib/checkout"
import { Separator } from "@/components/ui/separator"
import { useCart } from "../cart-context"
import { CopyRow } from "./copy-row"
import { CancelWindow } from "./cancel-window"

export function ConfirmationView() {
  const { order, orderCanceled, cancelOrder, resetAndShop, setView } = useCart()

  // Safety: should never render without an order, but guard anyway.
  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">No recent order found.</p>
        <button
          type="button"
          onClick={() => setView("home")}
          className="mt-4 h-11 rounded-md bg-foreground px-6 text-sm font-semibold text-background"
        >
          Back to home
        </button>
      </div>
    )
  }

  const { items, totals } = order

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Hero */}
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </span>
        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-foreground">
          Thank you for your order!
        </h1>
        <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
          {"We've sent a confirmation to "}
          <span className="font-medium text-foreground">{order.email}</span>
          {". You'll get a shipping update as soon as your order is on its way."}
        </p>
      </div>

      {/* Order + tracking ids */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <CopyRow label="Order number" value={order.number} />
        <CopyRow label="Tracking ID" value={order.trackingId} />
      </div>

      {/* Cancellation window */}
      <div className="mt-4">
        <CancelWindow
          placedAt={order.placedAt}
          canceled={orderCanceled}
          onCancel={cancelOrder}
        />
      </div>

      {/* Order summary */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-foreground" strokeWidth={2} />
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Order Summary
          </h2>
        </div>

        <ul className="mt-5 space-y-5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                  {item.quantity}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.variant}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {formatUSD(item.unitPrice * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Separator className="my-5" />

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium text-foreground tabular-nums">
              {formatUSD(totals.subtotal)}
            </dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Professional discount</dt>
              <dd className="font-medium text-emerald-600 tabular-nums">
                -{formatUSD(totals.discount)}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Truck className="h-4 w-4" strokeWidth={1.75} />
              Shipping
            </dt>
            <dd className="font-medium uppercase tracking-wide text-emerald-600">
              Free
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="font-medium text-foreground tabular-nums">
              {formatUSD(totals.tax)}
            </dd>
          </div>
        </dl>

        <Separator className="my-5" />

        <div className="flex items-end justify-between">
          <span className="text-sm font-medium text-foreground">Total paid</span>
          <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {formatUSD(totals.total)}
          </span>
        </div>
      </section>

      {/* Delivery details */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Delivery Details
        </h2>
        <dl className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Shipping to
              </dt>
              <dd className="mt-0.5 text-sm text-foreground">{order.shipName}</dd>
              <dd className="text-sm text-muted-foreground">{order.shipAddress}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Confirmation email
              </dt>
              <dd className="mt-0.5 text-sm text-foreground">{order.email}</dd>
            </div>
          </div>
        </dl>
      </section>

      {/* Continue */}
      <button
        type="button"
        onClick={resetAndShop}
        className="mt-6 h-12 w-full rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Continue Shopping
      </button>
    </div>
  )
}
