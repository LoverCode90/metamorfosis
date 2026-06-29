import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { caseStatusBadge } from "@/lib/admin/status-badge"
import { caseReasonLabel } from "@/lib/profile/case-reasons"
import type { AdminCaseListItem } from "@/lib/cases/types"

function orderLabel(squareOrderId: string | undefined): string {
  if (!squareOrderId) return "—"
  return squareOrderId.startsWith("MF-")
    ? squareOrderId
    : `#${squareOrderId.slice(0, 8).toUpperCase()}`
}

/** One row of the admin cases table. */
export function CaseTableRow({ caseItem }: { caseItem: AdminCaseListItem }) {
  const badge = caseStatusBadge(caseItem.status)

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-5 py-3">
        <Link href={`/admin/cases/${caseItem.id}`} className="block">
          <span className="text-foreground font-medium">
            {caseItem.profiles?.full_name ?? "Unknown"}
          </span>
          <span className="text-muted-foreground block text-xs">
            {caseItem.profiles?.email ?? "—"}
          </span>
        </Link>
      </td>
      <td className="px-5 py-3 font-medium">
        {orderLabel(caseItem.orders?.square_order_id)}
      </td>
      <td className="px-5 py-3">{caseReasonLabel(caseItem.reason)}</td>
      <td className="px-5 py-3">
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </td>
      <td className="text-muted-foreground px-5 py-3 whitespace-nowrap">
        {formatDistanceToNow(new Date(caseItem.created_at), {
          addSuffix: true,
        })}
      </td>
    </tr>
  )
}
