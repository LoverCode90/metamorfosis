import Link from "next/link"

import { cn } from "@/lib/utils"
import type { AdminCaseDetail } from "@/lib/cases/types"

/** Customer info card for case detail. */
export function CaseCustomerInfoCard({
  caseData,
  className,
}: {
  caseData: AdminCaseDetail
  className?: string
}) {
  const customer = caseData.profiles

  return (
    <section
      className={cn("border-border rounded-xl border p-5 sm:p-6", className)}
    >
      <h3 className="text-foreground mb-4 text-sm font-semibold">
        Customer Info
      </h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs uppercase">Name</p>
          <p className="font-medium break-words">{customer?.full_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">Email</p>
          <a
            href={`mailto:${customer?.email}`}
            className="text-foreground break-all hover:underline"
          >
            {customer?.email}
          </a>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">Phone</p>
          <p>{customer?.phone_number || "Not provided"}</p>
        </div>
      </div>
    </section>
  )
}

/** Linked order summary for case detail. */
export function CaseOrderContextCard({
  caseData,
  className,
}: {
  caseData: AdminCaseDetail
  className?: string
}) {
  const order = caseData.orders

  return (
    <section
      className={cn("border-border rounded-xl border p-5 sm:p-6", className)}
    >
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
