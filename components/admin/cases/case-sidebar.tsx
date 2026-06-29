import Link from "next/link"

import type { AdminCaseDetail } from "@/lib/cases/types"

/** Customer info + order context sidebar for the case detail page. */
export function CaseSidebar({ caseData }: { caseData: AdminCaseDetail }) {
  const customer = caseData.profiles
  const order = caseData.orders

  return (
    <div className="space-y-8">
      <section className="border-border bg-card rounded-2xl border p-6">
        <h3 className="text-foreground mb-4 font-semibold">Customer Info</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">{customer?.full_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <a
              href={`mailto:${customer?.email}`}
              className="text-foreground hover:underline"
            >
              {customer?.email}
            </a>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p>{customer?.phone_number || "Not provided"}</p>
          </div>
        </div>
      </section>

      <section className="border-border bg-card rounded-2xl border p-6">
        <h3 className="text-foreground mb-4 font-semibold">Order Context</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">Order ID</p>
            <Link
              href={`/admin/orders/${order?.id}`}
              className="text-foreground font-medium hover:underline"
            >
              {order?.square_order_id}
            </Link>
          </div>
          <div>
            <p className="text-muted-foreground">Order Status</p>
            <p className="capitalize">{order?.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Placed On</p>
            <p>{new Date(order?.created_at || "").toLocaleDateString()}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
