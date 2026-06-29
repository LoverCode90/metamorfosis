import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { AdminStatusFilter } from "@/components/admin/admin-status-filter"
import { CaseTableRow } from "@/components/admin/cases/case-table-row"
import { CaseMobileCard } from "@/components/admin/cases/case-mobile-card"
import type { AdminCaseListItem } from "@/lib/cases/types"

export const metadata = { title: "Cases Admin — Metamorfosis Beauty" }

const CASE_STATUS_FILTERS = [
  "open",
  "pending_review",
  "approved",
  "rejected",
  "closed",
]

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

      {cases.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground rounded-2xl border px-5 py-12 text-center text-sm">
          No cases found.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="border-border bg-card hidden overflow-hidden rounded-2xl border md:block">
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
                {cases.map((caseItem) => (
                  <CaseTableRow key={caseItem.id} caseItem={caseItem} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {cases.map((caseItem) => (
              <CaseMobileCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
