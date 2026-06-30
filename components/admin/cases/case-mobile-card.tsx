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

/** Card representation of a case row for narrow screens. */
export function CaseMobileCard({ caseItem }: { caseItem: AdminCaseListItem }) {
  const badge = caseStatusBadge(caseItem.status)

  return (
    <Link
      href={`/admin/cases/${caseItem.id}`}
      className="border-border/50 bg-card/90 hover:border-primary/30 block rounded-2xl border p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">
            {caseItem.profiles?.full_name ?? "Unknown"}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {caseItem.profiles?.email ?? "—"}
          </p>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      <p className="text-foreground mt-3 text-sm">
        {caseReasonLabel(caseItem.reason)}
      </p>

      <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
        <span>{orderLabel(caseItem.orders?.square_order_id)}</span>
        <span>
          {formatDistanceToNow(new Date(caseItem.created_at), {
            addSuffix: true,
          })}
        </span>
      </div>
    </Link>
  )
}
