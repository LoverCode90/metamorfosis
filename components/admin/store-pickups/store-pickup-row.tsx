import { format } from "date-fns"
import { memo } from "react"

import { CancelPickupButton } from "@/components/admin/orders/cancel-pickup-button"
import { FulfillPickupButton } from "@/components/admin/store-pickups/fulfill-pickup-button"
import { StorePickupStatusBadge } from "@/components/admin/store-pickups/store-pickup-status-badge"
import {
  customerEmail,
  customerName,
  orderLabel,
  type AdminOrderItemSummary,
} from "@/lib/admin/order-list"
import { pickupUrgency, pickupUrgencyLabel } from "@/lib/admin/pickup-urgency"
import { resolvePickupDeadline } from "@/lib/admin/resolve-pickup-deadline"
import type {
  StorePickupHistoryOrder,
  StorePickupOrder,
} from "@/lib/admin/store-pickup-types"
import { itemLabel } from "@/lib/orders/item-label"
import { cn } from "@/lib/utils"
import { formatUSD } from "@/lib/utils/format"

interface StorePickupRowProps {
  order: StorePickupOrder | StorePickupHistoryOrder
  mode: "pending" | "history"
}

function customerPhone(order: StorePickupOrder): string | null {
  const phone = order.shipping_address?.phone?.trim()
  return phone || null
}

function pickupItems(items: AdminOrderItemSummary[]) {
  return items.map((item) => ({
    key: `${item.product_variations?.name_en ?? "item"}-${item.quantity}`,
    label: itemLabel(
      item.product_variations?.product_translations?.name_en,
      item.product_variations?.name_en,
    ),
    quantity: item.quantity,
  }))
}

export const StorePickupRow = memo(function StorePickupRow({
  order,
  mode,
}: StorePickupRowProps) {
  const ticket = orderLabel(order.square_order_id)
  const deadline = resolvePickupDeadline(
    order.created_at,
    order.pickup_deadline_at,
  )
  const urgency = mode === "pending" ? pickupUrgency(deadline) : null
  const cancelSource = "cancelSource" in order ? order.cancelSource : undefined
  const items = pickupItems(order.order_items)

  return (
    <article className="border-border bg-card rounded-2xl border p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium">
            Pickup ticket — ask customer for this number
          </p>
          <p className="text-foreground mt-1 text-3xl font-bold tracking-tight tabular-nums md:text-4xl">
            {ticket}
          </p>
        </div>
        <StorePickupStatusBadge
          status={order.status}
          cancelSource={cancelSource}
        />
      </div>

      {urgency && (
        <p
          className={cn(
            "mt-4 rounded-xl border px-4 py-3 text-sm leading-relaxed font-medium",
            urgency === "overdue"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
          )}
        >
          {pickupUrgencyLabel(urgency)}
        </p>
      )}

      <dl className="mt-5 grid gap-4 text-base sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-sm">Customer name</dt>
          <dd className="text-foreground mt-1 text-lg font-semibold">
            {customerName(order)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Email</dt>
          <dd className="text-foreground mt-1 break-all">
            {customerEmail(order)}
          </dd>
        </div>
        {customerPhone(order) && (
          <div>
            <dt className="text-muted-foreground text-sm">Phone</dt>
            <dd className="text-foreground mt-1 text-lg">
              {customerPhone(order)}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-muted-foreground text-sm">Order placed</dt>
          <dd className="text-foreground mt-1">
            {format(new Date(order.created_at), "MMM d, yyyy h:mm a")}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Pick up by</dt>
          <dd className="text-foreground mt-1 text-lg font-medium">
            {format(deadline, "EEEE, MMM d, yyyy")}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Total paid</dt>
          <dd className="text-foreground mt-1 text-lg font-semibold tabular-nums">
            {formatUSD(order.total_cents)}
          </dd>
        </div>
      </dl>

      {items.length > 0 && (
        <div className="mt-5">
          <p className="text-muted-foreground text-sm font-medium">
            Items in bag
          </p>
          <ul className="text-foreground mt-2 space-y-1 text-base">
            {items.map((item) => (
              <li key={item.key}>
                {item.quantity}× {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cancelSource === "deadline_expired" && (
        <p className="text-muted-foreground border-border mt-5 rounded-xl border bg-amber-500/5 px-4 py-3 text-sm leading-relaxed">
          The 5-day pickup window passed. The customer was emailed and their
          payment will be refunded automatically via Square.
        </p>
      )}

      {mode === "pending" && (
        <div className="border-border mt-6 space-y-3 border-t pt-5">
          <p className="text-foreground text-sm font-semibold">
            After you hand the bag to the customer:
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <FulfillPickupButton
              orderId={order.id}
              ticketLabel={ticket}
              size="lg"
              className="sm:flex-1"
            />
            <CancelPickupButton
              orderId={order.id}
              size="lg"
              className="sm:flex-1"
            />
          </div>
        </div>
      )}

      {mode === "history" && order.picked_up_at && (
        <p className="text-muted-foreground mt-5 text-sm">
          Picked up {format(new Date(order.picked_up_at), "MMM d, yyyy h:mm a")}
        </p>
      )}
    </article>
  )
})
