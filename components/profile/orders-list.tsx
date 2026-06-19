/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react"
import type { DbOrder } from "@/lib/orders/queries"
import { cn } from "@/lib/utils"

interface OrdersListProps {
  orders: DbOrder[]
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: { label: "Pending", color: "text-amber-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-500", icon: Package },
  processing: { label: "Processing", color: "text-blue-500", icon: Package },
  shipped: { label: "Shipped", color: "text-purple-500", icon: Truck },
  delivered: {
    label: "Delivered",
    color: "text-green-500",
    icon: CheckCircle,
  },
  cancelled: { label: "Cancelled", color: "text-red-500", icon: XCircle },
  refunded: { label: "Refunded", color: "text-red-400", icon: XCircle },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function fmtDollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="border-border flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
        <span className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
          <Package
            className="text-muted-foreground h-6 w-6"
            strokeWidth={1.5}
          />
        </span>
        <p className="text-foreground mt-5 text-base font-semibold">
          No orders yet
        </p>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
          Once you place an order, it will appear here.
        </p>
        <Link
          href="/products"
          className="bg-foreground text-background mt-6 inline-flex h-11 items-center rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => {
        const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.confirmed
        const StatusIcon = cfg.icon
        const addr = order.shipping_address
        const itemCount = order.order_items.reduce((s, i) => s + i.quantity, 0)
        const firstItem = order.order_items[0]

        return (
          <div
            key={order.id}
            className="border-border bg-card rounded-2xl border p-5"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-xs">
                  {fmtDate(order.created_at)}
                </p>
                <p className="text-foreground mt-0.5 font-semibold tabular-nums">
                  {order.square_order_id.startsWith("MF-")
                    ? order.square_order_id
                    : `#${order.id.slice(0, 8).toUpperCase()}`}
                </p>
              </div>
              <span
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold",
                  cfg.color,
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />
                {cfg.label}
              </span>
            </div>

            {/* Items preview */}
            <div className="border-border mt-4 flex items-center gap-3 border-t pt-4">
              {firstItem?.product_variations?.image_url ? (
                <img
                  src={firstItem.product_variations.image_url}
                  alt={firstItem.product_variations.name_en ?? ""}
                  className="border-border h-12 w-12 shrink-0 rounded-md border object-cover"
                />
              ) : (
                <div className="bg-muted border-border h-12 w-12 shrink-0 rounded-md border" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {firstItem?.product_variations?.name_en ?? "Item"}
                  {order.order_items.length > 1 &&
                    ` + ${order.order_items.length - 1} more`}
                </p>
                <p className="text-muted-foreground text-xs">
                  {itemCount} {itemCount === 1 ? "item" : "items"} · Shipped to{" "}
                  {addr.city}, {addr.state}
                </p>
              </div>
              <p className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
                {fmtDollars(order.total_cents)}
              </p>
            </div>

            {/* Tracking + actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {order.tracking_number ? (
                <div>
                  <p className="text-muted-foreground text-xs">Tracking</p>
                  {order.tracking_url ? (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground text-xs font-medium tabular-nums hover:underline"
                    >
                      {order.tracking_number}
                    </a>
                  ) : (
                    <p className="text-foreground text-xs font-medium tabular-nums">
                      {order.tracking_number}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {order.status === "delivered"
                    ? "Delivered"
                    : "Tracking not yet available"}
                </p>
              )}
              <Link
                href={`/tracking?orderId=${order.id}`}
                className="border-border text-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
              >
                Track order
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
