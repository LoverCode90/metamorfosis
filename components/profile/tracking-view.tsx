/* eslint-disable @next/next/no-img-element */
"use client"

import { ArrowLeft, Check, MapPin, Package, Truck, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import type { DbOrder } from "@/lib/orders/types"
import { orderStatusToStageIndex } from "@/lib/orders/types"
import { cn } from "@/lib/utils"

const STAGES = [
  { id: "placed", label: "Order placed", icon: Check },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
]

function fmtDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function fmtDollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

interface TrackingViewProps {
  order: DbOrder | null
}

export function TrackingView({ order }: TrackingViewProps) {
  const router = useRouter()
  const currentStage = order ? orderStatusToStageIndex(order.status) : 0
  const isCancelled =
    order?.status === "cancelled" || order?.status === "refunded"
  const addr = order?.shipping_address

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <button
        type="button"
        onClick={() => router.push("/orders")}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to orders
      </button>

      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          My Account
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Order Tracking
        </h1>
      </div>

      {!order ? (
        <div className="border-border mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <span className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
            <Package
              className="text-muted-foreground h-6 w-6"
              strokeWidth={1.5}
            />
          </span>
          <p className="text-foreground mt-5 text-base font-semibold">
            Order not found
          </p>
          <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
            We couldn&apos;t find this order. It may belong to a different
            account, or the link may have expired.
          </p>
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="bg-foreground text-background mt-6 inline-flex h-11 items-center rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            View my orders
          </button>
        </div>
      ) : (
        <>
          {/* Order header */}
          <section className="border-border bg-card mt-8 rounded-2xl border p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Order
                </p>
                <p className="text-foreground text-base font-semibold">
                  {order.square_order_id.startsWith("MF-")
                    ? order.square_order_id
                    : `#${order.id.slice(0, 8).toUpperCase()}`}
                </p>
              </div>
              {order.tracking_number && (
                <div className="text-right">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Tracking #
                  </p>
                  {order.tracking_url ? (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground text-base font-semibold tabular-nums hover:underline"
                    >
                      {order.tracking_number}
                    </a>
                  ) : (
                    <p className="text-foreground text-base font-semibold tabular-nums">
                      {order.tracking_number}
                    </p>
                  )}
                </div>
              )}
            </div>
            {addr && (
              <div className="border-border text-muted-foreground mt-4 border-t pt-4 text-sm">
                Shipping to{" "}
                <span className="text-foreground font-medium">
                  {addr.fullName}
                </span>{" "}
                · {addr.streetLine1}, {addr.city}, {addr.state} {addr.zip}
              </div>
            )}
            {order.estimated_delivery_date && (
              <p className="text-muted-foreground mt-2 text-xs">
                Estimated delivery:{" "}
                <span className="text-foreground font-medium">
                  {fmtDate(order.estimated_delivery_date)}
                </span>
              </p>
            )}
          </section>

          {/* Tracking stages */}
          <section className="border-border bg-card mt-6 rounded-2xl border p-6">
            {isCancelled ? (
              <div className="flex items-center gap-3">
                <XCircle
                  className="text-destructive h-5 w-5"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    {order.status === "cancelled"
                      ? "Order cancelled"
                      : "Order refunded"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Please contact support if you have questions.
                  </p>
                </div>
              </div>
            ) : (
              <ol className="flex flex-col">
                {STAGES.map((stage, i) => {
                  const done = i <= currentStage
                  const isLast = i === STAGES.length - 1
                  const Icon = stage.icon
                  return (
                    <li key={stage.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full",
                            done
                              ? "bg-foreground text-background"
                              : "border-border bg-background text-muted-foreground border",
                          )}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </span>
                        {!isLast && (
                          <span
                            className={cn(
                              "my-1 w-px flex-1",
                              i < currentStage ? "bg-foreground" : "bg-border",
                            )}
                          />
                        )}
                      </div>
                      <div className={isLast ? "pt-1 pb-0" : "pt-1 pb-8"}>
                        <p
                          className={cn(
                            "text-sm",
                            done
                              ? "text-foreground font-semibold"
                              : "text-muted-foreground font-medium",
                          )}
                        >
                          {stage.label}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {i === currentStage
                            ? "In progress"
                            : done
                              ? "Completed"
                              : "Pending"}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

          {/* Items */}
          <section className="border-border bg-card mt-6 rounded-2xl border p-6">
            <h3 className="text-foreground text-sm font-semibold">
              Items in this order
            </h3>
            <ul className="divide-border mt-4 flex flex-col divide-y">
              {order.order_items.map((item) => {
                const lineTotal =
                  item.unit_price_cents * item.quantity - item.discount_cents
                return (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <div className="border-border bg-muted h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                      {item.product_variations?.image_url ? (
                        <img
                          src={item.product_variations.image_url}
                          alt={item.product_variations.name_en ?? ""}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {item.product_variations?.name_en ?? "Item"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Qty {item.quantity}
                        {item.discount_cents > 0 &&
                          ` · ${fmtDollars(item.discount_cents)} pro discount`}
                      </p>
                    </div>
                    <span className="text-foreground text-sm font-semibold tabular-nums">
                      {fmtDollars(lineTotal)}
                    </span>
                  </li>
                )
              })}
            </ul>

            {/* Order totals */}
            <div className="border-border mt-4 space-y-1.5 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  {fmtDollars(order.subtotal_cents)}
                </span>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pro discount</span>
                  <span className="text-green-500">
                    −{fmtDollars(order.discount_cents)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">
                  {order.shipping_cents === 0
                    ? "FREE"
                    : fmtDollars(order.shipping_cents)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">
                  {fmtDollars(order.tax_cents)}
                </span>
              </div>
              <div className="border-border flex justify-between border-t pt-2 text-sm font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  {fmtDollars(order.total_cents)}
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
