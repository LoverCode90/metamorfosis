import Link from "next/link"
import { Check, Minus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { orderStatusBadge } from "@/lib/admin/status-badge"
import { formatUSD } from "@/lib/utils/format"
import {
  customerEmail,
  customerName,
  itemsSummary,
  orderLabel,
  type AdminOrderListItem,
} from "@/lib/admin/order-list"

/** Card representation of an order row for narrow screens. */
export function OrderMobileCard({ order }: { order: AdminOrderListItem }) {
  const badge = orderStatusBadge(order.status)

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="border-border bg-card hover:border-border-strong block rounded-2xl border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-foreground font-medium break-words">
            {customerName(order)}
          </p>
          <p className="text-muted-foreground text-xs break-all">
            {customerEmail(order)}
          </p>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      <p className="text-muted-foreground mt-3 text-sm break-words whitespace-normal">
        {itemsSummary(order.order_items)}
      </p>

      <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
        <span>{orderLabel(order.square_order_id)}</span>
        <span className="text-foreground font-medium">
          {formatUSD(order.total_cents)}
        </span>
      </div>

      <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
        <span>{new Date(order.created_at).toLocaleDateString()}</span>
        {order.tracking_number ? (
          <span className="text-accent-emerald inline-flex items-center gap-1 font-medium">
            <Check className="h-3.5 w-3.5" /> Tracked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Minus className="h-3.5 w-3.5" /> No tracking
          </span>
        )}
      </div>
    </Link>
  )
}
