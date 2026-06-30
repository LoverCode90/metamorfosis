"use client"

import { memo } from "react"

import type { EligiblePickupOrder } from "@/lib/admin/carrier-pickup-types"
import { formatRelativeTime } from "@/lib/admin/format-relative-time"

interface PickupEligibleSummaryProps {
  total: number
  uspsCount: number
  dhlCount: number
  orders: EligiblePickupOrder[]
}

/** Lists labeled orders waiting for a carrier pickup. */
export function PickupEligibleSummary({
  total,
  uspsCount,
  dhlCount,
  orders,
}: PickupEligibleSummaryProps) {
  if (total === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No labeled orders are waiting for pickup. Generate labels from confirmed
        orders first.
      </p>
    )
  }

  const preview = orders.slice(0, 6)

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-medium">{total}</span> labeled
        order{total === 1 ? "" : "s"} ready —{" "}
        <span className="text-foreground">{uspsCount} USPS</span>,{" "}
        <span className="text-foreground">{dhlCount} DHL Express</span>. USPS
        allows one pickup per day at this address.
      </p>

      <ul className="divide-border/60 border-border/60 divide-y rounded-xl border">
        {preview.map((order) => (
          <PickupEligibleRow key={order.id} order={order} />
        ))}
      </ul>

      {orders.length > preview.length && (
        <p className="text-muted-foreground text-xs">
          + {orders.length - preview.length} more order
          {orders.length - preview.length === 1 ? "" : "s"}
        </p>
      )}
    </div>
  )
}

const PickupEligibleRow = memo(function PickupEligibleRow({
  order,
}: {
  order: EligiblePickupOrder
}) {
  const shortId = order.squareOrderId.slice(-8).toUpperCase()

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="text-foreground truncate font-medium">#{shortId}</p>
        <p className="text-muted-foreground truncate text-xs">
          {order.carrier}
        </p>
      </div>
      <span className="text-muted-foreground shrink-0 text-xs">
        {formatRelativeTime(order.createdAt)}
      </span>
    </li>
  )
})
