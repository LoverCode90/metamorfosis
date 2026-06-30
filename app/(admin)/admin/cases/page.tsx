import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { AdminStatusFilter } from "@/components/admin/admin-status-filter"
import { CaseTableRow } from "@/components/admin/cases/case-table-row"
import { CaseMobileCard } from "@/components/admin/cases/case-mobile-card"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import {
  ADMIN_TABLE_HEAD_CLASS,
  ADMIN_TABLE_SHELL_CLASS,
} from "@/lib/admin/card-styles"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
      <AdminPageHeader
        title="Cases & Returns"
        description="Manage support tickets, return requests, and customer conversations."
      />

      <AdminStatusFilter
        basePath="/admin/cases"
        active={status}
        options={CASE_STATUS_FILTERS}
      />

      {cases.length === 0 ? (
        <div className="border-border/50 bg-card/90 text-muted-foreground rounded-2xl border px-5 py-12 text-center text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm">
          No cases found.
        </div>
      ) : (
        <>
          <div className={`hidden md:block ${ADMIN_TABLE_SHELL_CLASS}`}>
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} px-5 py-3`}>
                    Customer
                  </TableHead>
                  <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} px-5 py-3`}>
                    Order
                  </TableHead>
                  <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} px-5 py-3`}>
                    Reason
                  </TableHead>
                  <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} px-5 py-3`}>
                    Status
                  </TableHead>
                  <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} px-5 py-3`}>
                    Opened
                  </TableHead>
                  <TableHead
                    className={`${ADMIN_TABLE_HEAD_CLASS} px-5 py-3 text-right`}
                  >
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem) => (
                  <CaseTableRow key={caseItem.id} caseItem={caseItem} />
                ))}
              </TableBody>
            </Table>
          </div>

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
