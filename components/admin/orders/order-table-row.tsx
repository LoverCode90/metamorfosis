import Link from "next/link"
import { memo } from "react"
import { ArrowRight, Check, Minus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { displayInitialsFromName } from "@/lib/admin/display-initials"
import { AdminOrderItemsPreview } from "@/components/admin/admin-order-items-preview"
import { orderStatusBadge } from "@/lib/admin/status-badge"
import { formatUSD } from "@/lib/utils/format"
import {
  customerEmail,
  customerName,
  orderLabel,
  type AdminOrderListItem,
} from "@/lib/admin/order-list"

interface OrderTableRowProps {
  order: AdminOrderListItem
}

/** One row of the admin orders table. */
export const OrderTableRow = memo(function OrderTableRow({
  order,
}: OrderTableRowProps) {
  const statusBadge = orderStatusBadge(order.status)
  const orderDetailHref = `/admin/orders/${order.id}`
  const customerDisplayName = customerName(order)
  const customerInitials = displayInitialsFromName(customerDisplayName)

  return (
    <TableRow className="border-border/40 hover:bg-primary/5 data-[state=selected]:bg-primary/10">
      <TableCell className="px-5 py-4">
        <Link href={orderDetailHref} className="flex items-center gap-3">
          <div className="bg-primary/15 text-primary ring-primary/25 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1">
            {customerInitials}
          </div>
          <div className="min-w-0">
            <span className="text-foreground block font-medium break-words">
              {customerDisplayName}
            </span>
            <span className="text-muted-foreground block text-xs break-all">
              {customerEmail(order)}
            </span>
            <span className="text-muted-foreground/80 block text-[11px]">
              {orderLabel(order.square_order_id)}
            </span>
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground px-5 py-4 whitespace-nowrap">
        {new Date(order.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-muted-foreground max-w-[240px] px-5 py-4 whitespace-normal">
        <AdminOrderItemsPreview items={order.order_items} />
      </TableCell>
      <TableCell className="px-5 py-4">
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
      </TableCell>
      <TableCell className="px-5 py-4">
        {order.tracking_number ? (
          <span className="text-accent-emerald inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium ring-1 ring-emerald-500/20">
            <Check className="h-3.5 w-3.5" /> Label printed
          </span>
        ) : (
          <span className="text-accent-amber inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium ring-1 ring-amber-500/20">
            <Minus className="h-3.5 w-3.5" /> Needs label
          </span>
        )}
      </TableCell>
      <TableCell className="text-foreground px-5 py-4 text-right font-semibold whitespace-nowrap">
        {formatUSD(order.total_cents)}
      </TableCell>
      <TableCell className="px-5 py-4 text-right">
        <Link
          href={orderDetailHref}
          className="text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors"
        >
          Open
          <ArrowRight className="h-4 w-4" />
        </Link>
      </TableCell>
    </TableRow>
  )
})

OrderTableRow.displayName = "OrderTableRow"
