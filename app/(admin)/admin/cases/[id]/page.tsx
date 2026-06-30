import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { CaseActions } from "@/components/admin/cases/case-actions"
import { CaseIssueDetails } from "@/components/admin/cases/case-issue-details"
import { CaseMessagePanel } from "@/components/admin/cases/case-message-panel"
import {
  CaseCustomerInfoCard,
  CaseOrderContextCard,
} from "@/components/admin/cases/case-context-cards"
import { EvidenceGallery } from "@/components/admin/cases/evidence-gallery"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
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

      <section className={`${ADMIN_SERVER_CARD_CLASS} p-5 sm:p-6`}>
        <div className="mb-5">
          <h2 className="text-foreground text-sm font-semibold tracking-tight">
            Resolution actions
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Approve, reject, or request more information from the customer.
          </p>
        </div>
        <CaseActions
          caseId={caseData.id}
          caseNumber={caseNumber}
          customerEmail={caseData.profiles?.email ?? ""}
          status={caseData.status}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <CaseIssueDetails caseData={caseData} />
        <CaseCustomerInfoCard caseData={caseData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div id="case-conversation">
          <CaseMessagePanel caseData={caseData} />
        </div>
        <CaseOrderContextCard caseData={caseData} className="h-fit" />
      </div>

      <section className={`${ADMIN_SERVER_CARD_CLASS} p-5 sm:p-6`}>
        <h2 className="text-foreground mb-4 text-sm font-semibold tracking-tight">
          Evidence photos
        </h2>
        <EvidenceGallery caseId={caseData.id} />
      </section>
    </div>
  )
}
