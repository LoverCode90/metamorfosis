import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { AdminProductThumb } from "@/components/admin/admin-product-thumb"
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

/** Card representation of a case row for narrow screens. */
export function CaseMobileCard({ caseItem }: { caseItem: AdminCaseListItem }) {
  const badge = caseStatusBadge(caseItem.status)
  const productLabel = itemLabel(
    caseItem.product_variations?.product_translations?.name_en,
    caseItem.product_variations?.name_en,
  )

  return (
    <Link
      href={`/admin/cases/${caseItem.id}`}
      className="border-border bg-card hover:bg-muted/30 block rounded-2xl border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-foreground font-medium break-words">
            {caseItem.profiles?.full_name ?? "Unknown"}
          </p>
          <p className="text-muted-foreground text-xs break-all">
            {caseItem.profiles?.email ?? "—"}
          </p>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {caseItem.product_variations && (
          <AdminProductThumb
            variation={caseItem.product_variations}
            alt={productLabel}
            size="md"
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
