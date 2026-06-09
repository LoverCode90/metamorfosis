"use client"

import { ArrowLeft, Check, MapPin, Package, Truck } from "lucide-react"
import { formatUSD } from "@/lib/checkout"
import { useCart } from "../cart-context"

const STAGES = [
  { id: "placed", label: "Order placed", icon: Check },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
]

export function TrackingView() {
  const { order, setView } = useCart()

  // Demo progress — an order sits at "shipped" once placed.
  const currentStage = order ? 2 : 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <button
        type="button"
        onClick={() => setView("profile")}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to profile
      </button>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          My Account
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Order Tracking
        </h1>
      </div>

      {!order ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </span>
          <p className="mt-5 text-base font-semibold text-foreground">No orders to track</p>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Once you place an order, you&apos;ll be able to follow it here in real time.
          </p>
          <button
            type="button"
            onClick={() => setView("products")}
            className="mt-6 inline-flex h-11 items-center rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Start shopping
          </button>
        </div>
      ) : (
        <>
          {/* Order summary header */}
          <section className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Order</p>
                <p className="text-base font-semibold text-foreground">{order.number}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tracking ID</p>
                <p className="text-base font-semibold tabular-nums text-foreground">
                  {order.trackingId}
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
              Shipping to{" "}
              <span className="font-medium text-foreground">{order.shipName}</span> ·{" "}
              {order.shipAddress}
            </div>
          </section>

          {/* Timeline */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-6">
            <ol className="flex flex-col">
              {STAGES.map((stage, i) => {
                const done = i <= currentStage
                const isLast = i === STAGES.length - 1
                const Icon = stage.icon
                return (
                  <li key={stage.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={
                          done
                            ? "flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background"
                            : "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
                        }
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      {!isLast && (
                        <span
                          className={
                            i < currentStage
                              ? "my-1 w-px flex-1 bg-foreground"
                              : "my-1 w-px flex-1 bg-border"
                          }
                        />
                      )}
                    </div>
                    <div className={isLast ? "pb-0 pt-1" : "pb-8 pt-1"}>
                      <p
                        className={
                          done
                            ? "text-sm font-semibold text-foreground"
                            : "text-sm font-medium text-muted-foreground"
                        }
                      >
                        {stage.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
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
          </section>

          {/* Items */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">Items in this order</h3>
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formatUSD((item.unitPrice - item.discountPerItem) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
