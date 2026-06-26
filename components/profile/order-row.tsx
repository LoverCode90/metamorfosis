/* eslint-disable @next/next/no-img-element */
"use client"

import { memo } from "react"
import Link from "next/link"
import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CancelOrderButton } from "@/components/profile/cancel-order-button"
import { formatDate, formatUSD } from "@/lib/utils/format"
import type { DbOrder } from "@/lib/orders/types"

type BadgeVariant =
  | "warning"
  | "violet"
  | "secondary"
  | "success"
  | "destructive"

type StatusEntry = {
  label: string
  badgeVariant: BadgeVariant
  icon: React.ElementType
}

const STATUS_CONFIG: Record<string, StatusEntry> = {
  pending: { label: "Pending", badgeVariant: "warning", icon: Clock },
  confirmed: { label: "Confirmed", badgeVariant: "violet", icon: Package },
  processing: { label: "Processing", badgeVariant: "violet", icon: Package },
  shipped: { label: "Shipped", badgeVariant: "secondary", icon: Truck },
  delivered: { label: "Delivered", badgeVariant: "success", icon: CheckCircle },
  cancelled: { label: "Cancelled", badgeVariant: "destructive", icon: XCircle },
  refunded: { label: "Refunded", badgeVariant: "destructive", icon: XCircle },
}

const CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000

interface OrderRowProps {
  order: DbOrder
  /** Client clock (null until mounted) for the cancellation-window check. */
  now: number | null
}

/** A single order summary card (memoized — rendered in the orders list). */
export const OrderRow = memo(function OrderRow({ order, now }: OrderRowProps) {
  const statusConfig = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.confirmed
  const StatusIcon = statusConfig.icon
  const shippingAddress = order.shipping_address
  const itemCount = order.order_items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )
  const firstItem = order.order_items[0]

  const isCancellable =
    (order.status === "pending" || order.status === "confirmed") &&
    (!order.cases || order.cases.length === 0) &&
    now !== null &&
    now - new Date(order.created_at).getTime() <= CANCEL_WINDOW_MS

  return (
    <div className="border-border bg-card rounded-2xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs">
            {formatDate(order.created_at)}
          </p>
          <p className="text-foreground mt-0.5 font-semibold tabular-nums">
            {order.square_order_id.startsWith("MF-")
              ? order.square_order_id
              : `#${order.id.slice(0, 8).toUpperCase()}`}
          </p>
        </div>
        <Badge variant={statusConfig.badgeVariant}>
          <StatusIcon strokeWidth={2} />
          {statusConfig.label}
        </Badge>
      </div>

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
            {shippingAddress.city}, {shippingAddress.state}
          </p>
        </div>
        <p className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
          {formatUSD(order.total_cents)}
        </p>
      </div>

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
        <div className="flex items-center gap-2">
          {isCancellable && <CancelOrderButton orderId={order.id} />}
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/tracking?orderId=${order.id}`} />}
          >
            Track order
          </Button>
        </div>
      </div>
    </div>
  )
})
