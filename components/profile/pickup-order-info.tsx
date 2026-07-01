import { format } from "date-fns"

import {
  PICKUP_ADDRESS,
  PICKUP_HOURS,
  PICKUP_HOURS_NOTE,
} from "@/lib/checkout/pickup"
import { PICKUP_WINDOW_DAYS } from "@/lib/orders/order-status-config"
import type { DbOrder } from "@/lib/orders/types"

function resolvePickupDeadline(order: DbOrder): Date {
  if (order.pickup_deadline_at) {
    return new Date(order.pickup_deadline_at)
  }
  return new Date(
    new Date(order.created_at).getTime() +
      PICKUP_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  )
}

export function PickupOrderInfo({ order }: { order: DbOrder }) {
  const deadline = resolvePickupDeadline(order)

  return (
    <section className="border-border bg-card mt-6 rounded-2xl border p-6">
      <h2 className="text-foreground text-sm font-semibold">Store pickup</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        You can pick up your order any day during the hours below.
      </p>

      <div className="border-border mt-4 space-y-2 border-t pt-4">
        <p className="text-foreground text-sm font-medium">{PICKUP_ADDRESS}</p>
        <ul className="text-muted-foreground space-y-1 text-sm">
          {PICKUP_HOURS.map((line) => (
            <li key={line.days} className="flex justify-between gap-4">
              <span>{line.days}</span>
              <span className="text-foreground">{line.hours}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-xs">{PICKUP_HOURS_NOTE}</p>
      </div>

      <div className="border-border bg-muted/30 mt-4 rounded-xl border p-4">
        <p className="text-foreground text-sm font-medium">
          Pick up by {format(deadline, "EEEE, MMMM d, yyyy")}
        </p>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          You have {PICKUP_WINDOW_DAYS} calendar days from when the order was
          placed. Uncollected orders are automatically canceled and refunded.
        </p>
      </div>
    </section>
  )
}
