import Link from "next/link"
import { memo } from "react"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { AdminProductThumb } from "@/components/admin/admin-product-thumb"
import { displayInitialsFromName } from "@/lib/admin/display-initials"
import { caseStatusBadge } from "@/lib/admin/status-badge"
import { caseReasonLabel } from "@/lib/profile/case-reasons"
import { itemLabel } from "@/lib/orders/item-label"
import type { AdminCaseListItem } from "@/lib/cases/types"

function orderLabel(squareOrderId: string | undefined): string {
  if (!squareOrderId) return "—"
  return squareOrderId.startsWith("MF-")
    ? squareOrderId
    : `#${squareOrderId.slice(0, 8).toUpperCase()}`
}

interface CaseTableRowProps {
  caseItem: AdminCaseListItem
}

/** One row of the admin cases table. */
export const CaseTableRow = memo(function CaseTableRow({
  caseItem,
}: CaseTableRowProps) {
  const badge = caseStatusBadge(caseItem.status)
  const customerName = caseItem.profiles?.full_name ?? "Unknown"
  const caseDetailHref = `/admin/cases/${caseItem.id}`
  const productLabel = itemLabel(
    caseItem.product_variations?.product_translations?.name_en,
    caseItem.product_variations?.name_en,
  )

  return (
    <TableRow className="border-border/40 hover:bg-primary/5">
      <TableCell className="px-5 py-4">
        <Link href={caseDetailHref} className="flex items-center gap-3">
          <div className="bg-primary/15 text-primary ring-primary/25 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1">
            {displayInitialsFromName(customerName)}
          </div>
          <div className="min-w-0">
            <span className="text-foreground block font-medium break-words">
              {customerName}
            </span>
            <span className="text-muted-foreground block text-xs break-all">
              {caseItem.profiles?.email ?? "—"}
            </span>
          </div>
        </Link>
      </TableCell>
      <TableCell className="px-5 py-4 font-medium">
        {orderLabel(caseItem.orders?.square_order_id)}
      </TableCell>
      <TableCell className="text-muted-foreground px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {caseItem.product_variations && (
            <AdminProductThumb
              variation={caseItem.product_variations}
              alt={productLabel}
            />
          )}
          <div className="min-w-0">
            <p className="text-foreground text-sm font-medium">
              {caseReasonLabel(caseItem.reason)}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {productLabel}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-5 py-4">
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground px-5 py-4 whitespace-nowrap">
        {formatDistanceToNow(new Date(caseItem.created_at), {
          addSuffix: true,
        })}
      </TableCell>
      <TableCell className="px-5 py-4 text-right">
        <Link
          href={caseDetailHref}
          className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium"
        >
          View
          <ArrowRight className="size-3.5" />
        </Link>
      </TableCell>
    </TableRow>
  )
})

CaseTableRow.displayName = "CaseTableRow"
