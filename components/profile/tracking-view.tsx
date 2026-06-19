/* eslint-disable @next/next/no-img-element */
"use client"

import { ArrowLeft, Check, MapPin, Package, Truck } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatUSD } from "@/lib/utils/format"
import { useCartStore } from "@/stores/cart"

const STAGES = [
  { id: "placed", label: "Order placed", icon: Check },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
]

export function TrackingView() {
  const router = useRouter()
  const order = useCartStore((s) => s.order)

  const currentStage = order ? 2 : 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <button
        type="button"
        onClick={() => router.push("/profile")}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to profile
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
            No orders to track
          </p>
          <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
            Once you place an order, you&apos;ll be able to follow it here in
            real time.
          </p>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="bg-foreground text-background mt-6 inline-flex h-11 items-center rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Start shopping
          </button>
        </div>
      ) : (
        <>
          <section className="border-border bg-card mt-8 rounded-2xl border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Order
                </p>
                <p className="text-foreground text-base font-semibold">
                  {order.number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Tracking ID
                </p>
                <p className="text-foreground text-base font-semibold tabular-nums">
                  {order.trackingId}
                </p>
              </div>
            </div>
            <div className="border-border text-muted-foreground mt-4 border-t pt-4 text-sm">
              Shipping to{" "}
              <span className="text-foreground font-medium">
                {order.shipName}
              </span>{" "}
              · {order.shipAddress}
            </div>
          </section>

          <section className="border-border bg-card mt-6 rounded-2xl border p-6">
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
                            ? "bg-foreground text-background flex h-9 w-9 items-center justify-center rounded-full"
                            : "border-border bg-background text-muted-foreground flex h-9 w-9 items-center justify-center rounded-full border"
                        }
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      {!isLast && (
                        <span
                          className={
                            i < currentStage
                              ? "bg-foreground my-1 w-px flex-1"
                              : "bg-border my-1 w-px flex-1"
                          }
                        />
                      )}
                    </div>
                    <div className={isLast ? "pt-1 pb-0" : "pt-1 pb-8"}>
                      <p
                        className={
                          done
                            ? "text-foreground text-sm font-semibold"
                            : "text-muted-foreground text-sm font-medium"
                        }
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
          </section>

          <section className="border-border bg-card mt-6 rounded-2xl border p-6">
            <h3 className="text-foreground text-sm font-semibold">
              Items in this order
            </h3>
            <ul className="divide-border mt-4 flex flex-col divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <div className="border-border bg-muted h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {item.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-foreground text-sm font-semibold tabular-nums">
                    {formatUSD(
                      (item.unitPrice - item.discountPerItem) * item.quantity,
                    )}
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
