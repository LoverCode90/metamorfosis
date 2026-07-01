import type { DbOrder } from "@/lib/orders/types"
import { fmtDate } from "./tracking-helpers"

export function PickupOrderHeader({ order }: { order: DbOrder }) {
  return (
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
        <div className="text-right">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Fulfillment
          </p>
          <p className="text-foreground text-base font-semibold">
            In-store pickup
          </p>
        </div>
      </div>
      {order.picked_up_at && (
        <p className="text-muted-foreground mt-4 border-t pt-4 text-sm">
          Picked up on{" "}
          <span className="text-foreground font-medium">
            {fmtDate(order.picked_up_at)}
          </span>
        </p>
      )}
    </section>
  )
}
