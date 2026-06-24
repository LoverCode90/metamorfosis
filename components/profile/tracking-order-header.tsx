import type { DbOrder } from "@/lib/orders/types"
import { fmtDate } from "./tracking-helpers"

export function TrackingOrderHeader({ order }: { order: DbOrder }) {
  const addr = order.shipping_address

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
          <span className="text-foreground font-medium">{addr.fullName}</span> ·{" "}
          {addr.streetLine1}, {addr.city}, {addr.state} {addr.zip}
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
  )
}
