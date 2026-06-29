import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { CaseActions } from "@/components/admin/cases/case-actions"
import { CaseIssueDetails } from "@/components/admin/cases/case-issue-details"
import { CaseMessagePanel } from "@/components/admin/cases/case-message-panel"
import { CaseSidebar } from "@/components/admin/cases/case-sidebar"
import { EvidenceGallery } from "@/components/admin/cases/evidence-gallery"
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

  const c = data as unknown as AdminCaseDetail | null
  if (!c) notFound()

  const badge = caseStatusBadge(c.status)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/cases"
          className="border-border bg-background hover:bg-muted flex h-10 w-10 items-center justify-center rounded-md border transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Case Details
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review issue and manage resolution.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="border-border bg-card rounded-2xl border p-6">
            <div className="mb-6">
              <h2 className="text-foreground text-lg font-semibold">
                Resolution Actions
              </h2>
              <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                Current Status:
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
            </div>
            <CaseActions
              caseId={c.id}
              caseNumber={c.id.slice(0, 8).toUpperCase()}
              customerEmail={c.profiles?.email ?? ""}
              status={c.status}
            />
          </section>

          <CaseIssueDetails caseData={c} />

          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              Evidence Photos
            </h2>
            <EvidenceGallery caseId={c.id} />
          </section>

          <CaseMessagePanel caseData={c} />
        </div>

        <CaseSidebar caseData={c} />
      </div>
    </div>
  )
}
