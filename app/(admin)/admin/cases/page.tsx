import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { AdminStatusFilter } from "@/components/admin/admin-status-filter"
import { CasesHelpCard } from "@/components/admin/help/cases-help-card"
import { caseStatusLabel } from "@/lib/admin/admin-status-labels"
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

  if (!status) {
    redirect("/admin/cases?status=open")
  }

  const admin = createAdminClient()

  let query = admin
    .from("cases")
    .select(
      `id, status, reason, created_at,
       profiles ( full_name, email ),
       orders ( square_order_id )`,
    )
    .order("created_at", { ascending: false })

  if (status !== "all") query = query.eq("status", status)

  const { data } = await query
  const cases = (data as unknown as AdminCaseListItem[] | null) ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support cases"
        description="Returns, damaged items, and other customer issues."
      />

      <CasesHelpCard />

      <AdminStatusFilter
        basePath="/admin/cases"
        active={status}
        options={CASE_STATUS_FILTERS}
        labelFor={caseStatusLabel}
      />

      {cases.length === 0 ? (
        <div
          className={`${ADMIN_TABLE_SHELL_CLASS} text-muted-foreground px-5 py-12 text-center text-base leading-relaxed`}
        >
          No cases in this list.
          {status === "open" && (
            <> Open support requests will appear here when they need you.</>
          )}
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
