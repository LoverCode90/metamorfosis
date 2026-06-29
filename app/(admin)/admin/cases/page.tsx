import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { Badge } from "@/components/ui/badge"
import { AdminStatusFilter } from "@/components/admin/admin-status-filter"
import { caseStatusBadge } from "@/lib/admin/status-badge"
import { formatCaseStatus } from "@/lib/utils/format"
import type { AdminCaseListItem } from "@/lib/cases/types"
import { formatDistanceToNow } from "date-fns"

export const metadata = { title: "Cases Admin — Metamorfosis Beauty" }

const CASE_STATUS_FILTERS = [
  "open",
  "pending_review",
  "approved",
  "rejected",
  "closed",
]

function orderLabel(squareOrderId: string | undefined): string {
  if (!squareOrderId) return "—"
  return squareOrderId.startsWith("MF-")
    ? squareOrderId
    : `#${squareOrderId.slice(0, 8).toUpperCase()}`
}

export default async function AdminCasesPage(props: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireAdmin()
  const { status } = await props.searchParams
  const admin = createAdminClient()

  let query = admin
    .from("cases")
    .select(
      `id, status, reason, created_at,
       profiles ( full_name, email ),
       orders ( square_order_id )`,
    )
    .order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)

  const { data } = await query
  const cases = (data as unknown as AdminCaseListItem[] | null) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Cases &amp; Returns
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage support tickets and return requests.
        </p>
      </div>

      <AdminStatusFilter
        basePath="/admin/cases"
        active={status}
        options={CASE_STATUS_FILTERS}
      />

      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Opened</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {cases.map((caseItem) => {
                const badge = caseStatusBadge(caseItem.status)
                return (
                  <tr
                    key={caseItem.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/cases/${caseItem.id}`}
                        className="block"
                      >
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
                    <td className="px-5 py-3">
                      {formatCaseStatus(caseItem.reason)}
                    </td>
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
              })}
              {cases.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground px-5 py-8 text-center"
                  >
                    No cases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
