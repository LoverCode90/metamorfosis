import Link from "next/link"
import { ArrowRight, Check, Minus } from "lucide-react"

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

/** One row of the admin orders table. */
export function OrderTableRow({ order }: { order: AdminOrderListItem }) {
  const badge = orderStatusBadge(order.status)
  const href = `/admin/orders/${order.id}`

  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="px-5 py-3">
        <Link href={href} className="block">
          <span className="text-foreground font-medium">
            {customerName(order)}
          </span>
          <span className="text-muted-foreground block text-xs">
            {customerEmail(order)}
          </span>
          <span className="text-muted-foreground block text-xs">
            {orderLabel(order.square_order_id)}
          </span>
        </Link>
      </td>
      <td className="text-muted-foreground px-5 py-3 whitespace-nowrap">
        {new Date(order.created_at).toLocaleDateString()}
      </td>
      <td className="text-muted-foreground px-5 py-3">
        {itemsSummary(order.order_items)}
      </td>
      <td className="px-5 py-3">
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </td>
      <td className="px-5 py-3">
        {order.tracking_number ? (
          <span className="text-accent-emerald inline-flex items-center gap-1 text-xs font-medium">
            <Check className="h-3.5 w-3.5" /> Yes
          </span>
        ) : (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Minus className="h-3.5 w-3.5" /> No
          </span>
        )}
      </td>
      <td className="text-foreground px-5 py-3 text-right font-medium whitespace-nowrap">
        {formatUSD(order.total_cents)}
      </td>
      <td className="px-5 py-3 text-right">
        <Link
          href={href}
          className="text-muted-foreground hover:bg-muted inline-flex items-center justify-center rounded-md p-2"
          aria-label="View order"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  )
}
