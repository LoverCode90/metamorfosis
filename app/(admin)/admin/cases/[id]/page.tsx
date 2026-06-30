import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { CaseCustomerInfoCard } from "@/components/admin/cases/case-customer-info-card"
import { CaseEvidenceCard } from "@/components/admin/cases/case-evidence-card"
import { CaseIssueDetails } from "@/components/admin/cases/case-issue-details"
import { CaseMessagePanel } from "@/components/admin/cases/case-message-panel"
import { CaseOrderContextCard } from "@/components/admin/cases/case-order-context-card"
import { CaseResolutionActionsCard } from "@/components/admin/cases/case-resolution-actions-card"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import {
  CASE_DETAIL_PRIMARY_GRID_CLASS,
  CASE_DETAIL_SPLIT_GRID_CLASS,
} from "@/lib/admin/case-detail-grid"
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
        id, name_en, sku, price_cents,
        product_translations ( is_returnable, name_en )
      ),
      case_messages ( id, sender_id, message, created_at )`,
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
            description="Review the issue, evidence, and customer conversation."
            className="gap-2"
          />
        </div>
        <Badge variant={badge.variant} className="w-fit shrink-0">
          {badge.label}
        </Badge>
      </div>

      <div className={CASE_DETAIL_PRIMARY_GRID_CLASS}>
        <CaseResolutionActionsCard
          caseId={caseData.id}
          caseNumber={caseNumber}
          customerEmail={customerEmail}
          status={caseData.status}
        />
        <CaseOrderContextCard caseData={caseData} className="h-fit" />
      </div>

      <div className={CASE_DETAIL_PRIMARY_GRID_CLASS}>
        <CaseIssueDetails caseData={caseData} />
        <CaseCustomerInfoCard caseData={caseData} className="h-fit" />
      </div>

      <div className={CASE_DETAIL_SPLIT_GRID_CLASS}>
        <div id="case-conversation" className="min-h-0">
          <CaseMessagePanel caseData={caseData} />
        </div>
        <CaseEvidenceCard caseId={caseData.id} />
      </div>
    </div>
  )
}
