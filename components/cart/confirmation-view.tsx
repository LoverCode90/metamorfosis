/* eslint-disable @next/next/no-img-element */
"use client"

import { Check, Mail, MapPin, ShoppingBag, Truck } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatUSD } from "@/lib/utils/format"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { CopyRow } from "./copy-row"
import { CancelWindow } from "./cancel-window"

export function ConfirmationView() {
  const router = useRouter()
  const { order, orderCanceled, cancelOrder, resetCart } = useCart()

  if (!order) {
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

  const { items, totals } = order

  function handleContinueShopping() {
    resetCart()
    router.push("/")
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white sm:h-16 sm:w-16">
          <Check className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
        </span>
        <h1 className="text-foreground mt-5 text-2xl font-semibold tracking-tight text-balance sm:mt-6 sm:text-3xl">
          Thank you for your order!
        </h1>
        <p className="text-muted-foreground mt-2.5 max-w-md text-sm leading-relaxed text-pretty sm:mt-3 sm:text-base">
          {"We've sent a confirmation to "}
          <span className="text-foreground font-medium">{order.email}</span>
          {
            ". You'll get a shipping update as soon as your order is on its way."
          }
        </p>
      </div>

      <div className="mt-6 grid gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-3">
        <CopyRow label="Order number" value={order.number} />
        <CopyRow label="Tracking ID" value={order.trackingId} />
      </div>

      <div className="mt-4">
        <CancelWindow
          placedAt={order.placedAt}
          canceled={orderCanceled}
          onCancel={cancelOrder}
        />
      </div>

      <section className="border-border bg-card mt-4 rounded-xl border p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-foreground h-4 w-4" strokeWidth={2} />
          <h2 className="text-foreground text-sm font-semibold tracking-tight">
            Order Summary
          </h2>
        </div>

        <ul className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 sm:gap-4">
              <div className="border-border bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border sm:h-14 sm:w-14">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <span className="bg-foreground text-background absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold">
                  {item.quantity}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-medium">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {item.variant}
                  </p>
                </div>
                <p className="text-foreground text-sm font-semibold tabular-nums">
                  {formatUSD(item.unitPrice * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Separator className="my-4 sm:my-5" />

        <dl className="space-y-2.5 text-sm sm:space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground font-medium tabular-nums">
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
            <dt className="text-muted-foreground flex items-center gap-1.5">
              <Truck className="h-4 w-4" strokeWidth={1.75} />
              Shipping
            </dt>
            <dd className="font-medium tracking-wide text-emerald-600 uppercase">
              Free
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="text-foreground font-medium tabular-nums">
              {formatUSD(totals.tax)}
            </dd>
          </div>
        </dl>

        <Separator className="my-4 sm:my-5" />

        <div className="flex items-end justify-between">
          <span className="text-foreground text-sm font-medium">
            Total paid
          </span>
          <span className="text-foreground text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
            {formatUSD(totals.total)}
          </span>
        </div>
      </section>

      <section className="border-border bg-card mt-4 rounded-xl border p-4 sm:p-6">
        <h2 className="text-foreground text-sm font-semibold tracking-tight">
          Delivery Details
        </h2>
        <dl className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin
              className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0"
              strokeWidth={1.75}
            />
            <div className="min-w-0">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Shipping to
              </dt>
              <dd className="text-foreground mt-0.5 truncate text-sm">
                {order.shipName}
              </dd>
              <dd className="text-muted-foreground truncate text-sm">
                {order.shipAddress}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail
              className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0"
              strokeWidth={1.75}
            />
            <div className="min-w-0">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Confirmation email
              </dt>
              <dd className="text-foreground mt-0.5 truncate text-sm">
                {order.email}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      <button
        type="button"
        onClick={handleContinueShopping}
        className="bg-foreground text-background focus-visible:ring-ring mt-6 h-12 w-full rounded-md text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Continue Shopping
      </button>
    </div>
  )
}
