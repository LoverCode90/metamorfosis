import Link from "next/link"

import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
import { cn } from "@/lib/utils"
import type { AdminCaseDetail } from "@/lib/cases/types"

interface CaseOrderContextCardProps {
  caseData: AdminCaseDetail
  className?: string
}

/** Linked order summary for case detail. */
export function CaseOrderContextCard({
  caseData,
  className,
}: CaseOrderContextCardProps) {
  const order = caseData.orders

  return (
    <section className={cn(ADMIN_SERVER_CARD_CLASS, "p-5 sm:p-6", className)}>
      <h3 className="text-foreground mb-4 text-sm font-semibold">
        Order Context
      </h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs uppercase">Order ID</p>
          <Link
            href={`/admin/orders/${order?.id}`}
            className="text-foreground font-medium hover:underline"
          >
            {order?.square_order_id}
          </Link>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">
            Order Status
          </p>
          <p className="capitalize">{order?.status}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">Placed On</p>
          <p>{new Date(order?.created_at || "").toLocaleDateString()}</p>
        </div>
      </div>
    </section>
  )
}
