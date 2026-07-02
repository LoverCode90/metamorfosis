import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { CaseActions } from "@/components/admin/cases/case-actions"
import { CaseCustomerInfoCard } from "@/components/admin/cases/case-customer-info-card"
import { CaseEvidenceCard } from "@/components/admin/cases/case-evidence-card"
import { CaseIssueDetails } from "@/components/admin/cases/case-issue-details"
import { CaseOrderContextCard } from "@/components/admin/cases/case-order-context-card"
import { CasesHelpCard } from "@/components/admin/help/cases-help-card"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import { AdminSurfaceCard } from "@/components/admin/ui/admin-surface-card"
import { CASE_DETAIL_PRIMARY_GRID_CLASS } from "@/lib/admin/case-detail-grid"
import { Badge } from "@/components/ui/badge"
import { caseStatusBadge } from "@/lib/admin/status-badge"
import type { AdminCaseDetail } from "@/lib/cases/types"

export const metadata = { title: "Case Details — Metamorfosis Beauty Admin" }

export default async function AdminCaseDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const params = await props.params
  const admin = createAdminClient()

  const { data } = await admin
    .from("cases")
    .select(
      `*,
      profiles ( id, full_name, email, phone_number ),
      orders ( id, square_order_id, status, created_at, shipping_method ),
      product_variations (
        id, name_en, sku, price_cents, image_url,
        product_translations ( is_returnable, name_en, image_url )
      )`,
    )
    .eq("id", params.id)
    .single()

  const caseData = data as unknown as AdminCaseDetail | null
  if (!caseData) notFound()

  const badge = caseStatusBadge(caseData.status)
  const caseNumber = caseData.id.slice(0, 8).toUpperCase()
  const customerEmail = caseData.profiles?.email ?? ""

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            href="/admin/cases?status=open"
            className="border-border bg-card hover:bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <AdminPageHeader
            title={`Case #${caseNumber}`}
            description="Read the issue below, then choose an action at the bottom."
            className="gap-2"
          />
        </div>
        <Badge variant={badge.variant} className="w-fit shrink-0 text-sm">
          {badge.label}
        </Badge>
      </div>

      <CasesHelpCard />

      <div className={CASE_DETAIL_PRIMARY_GRID_CLASS}>
        <CaseIssueDetails caseData={caseData} />
        <div className="flex flex-col gap-6">
          <CaseCustomerInfoCard caseData={caseData} />
          <CaseOrderContextCard caseData={caseData} />
        </div>
      </div>

      <CaseEvidenceCard caseId={caseData.id} />

      <AdminSurfaceCard title="Your decision">
        <CaseActions
          caseId={caseData.id}
          caseNumber={caseNumber}
          customerEmail={customerEmail}
          status={caseData.status}
        />
      </AdminSurfaceCard>
    </div>
  )
}
