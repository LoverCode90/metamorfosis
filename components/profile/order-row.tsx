/* eslint-disable @next/next/no-img-element */
"use client"

import { memo } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CancelOrderButton } from "@/components/profile/cancel-order-button"
import { formatDate, formatUSD } from "@/lib/utils/format"
import {
  ORDER_STATUS_CONFIG,
  CANCEL_WINDOW_MS,
  RETURN_WINDOW_MS,
  PICKUP_WINDOW_DAYS,
} from "@/lib/orders/order-status-config"
import { isPickupShipment } from "@/lib/admin/is-pickup-shipment"
import { PICKUP_ADDRESS } from "@/lib/checkout/pickup"
import type { DbOrder } from "@/lib/orders/types"

interface OrderRowProps {
  order: DbOrder
  /** Client clock (null until mounted) for window checks. */
  now: number | null
}

export const OrderRow = memo(function OrderRow({ order, now }: OrderRowProps) {
  const statusConfig =
    ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.confirmed
  const StatusIcon = statusConfig.icon
  const shippingAddress = order.shipping_address
  const itemCount = order.order_items.reduce((sum, i) => sum + i.quantity, 0)
  const firstItem = order.order_items[0]

  const isCancelled =
    order.status === "cancelled" || order.status === "refunded"

  const isPickup = isPickupShipment(order.shipping_method, order.carrier)

  const pickupDeadline = order.pickup_deadline_at
    ? new Date(order.pickup_deadline_at)
    : new Date(
        new Date(order.created_at).getTime() +
          PICKUP_WINDOW_DAYS * 24 * 60 * 60 * 1000,
      )

  const isCancellable =
    (order.status === "pending" || order.status === "confirmed") &&
    (!order.cases || order.cases.length === 0) &&
    now !== null &&
    now - new Date(order.created_at).getTime() <= CANCEL_WINDOW_MS

  const isWithinReturnWindow =
    order.status === "delivered" &&
    now !== null &&
    now - new Date(order.created_at).getTime() <= RETURN_WINDOW_MS

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
            {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
            {isPickup
              ? `Pickup at ${PICKUP_ADDRESS.split(",")[0]}`
              : `Shipped to ${shippingAddress.city}, ${shippingAddress.state}`}
          </p>
          {isPickup && !isCancelled && (
            <p className="text-muted-foreground mt-0.5 text-xs">
              Pick up by {formatDate(pickupDeadline.toISOString())}
            </p>
          )}
        </div>
        <p className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
          {formatUSD(order.total_cents)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {order.tracking_number && !isCancelled && !isPickup && (
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
        )}
        <div className="flex items-center gap-2">
          {isCancellable && <CancelOrderButton orderId={order.id} />}
          {isWithinReturnWindow && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/orders/${order.id}/case`} />}
            >
              Report a problem
            </Button>
          )}
          {!isCancelled && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/tracking?orderId=${order.id}`} />}
            >
              {isPickup ? "View pickup" : "Track order"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})
