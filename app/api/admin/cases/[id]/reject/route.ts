import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendCaseRejected } from "@/lib/email/case-notifications"
import { requireAdmin } from "@/lib/admin/require-admin"
import { getCaseCustomer } from "@/lib/profile/case-customer"
import { z } from "zod"

// A customer-facing resolution message is required when rejecting a case.
const rejectSchema = z.object({
  resolution: z.string().trim().min(1, "A resolution message is required"),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: caseId } = await params
    const supabase = await createClient()
    const gate = await requireAdmin(supabase)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const json: unknown = await req.json().catch(() => ({}))
    const parsed = rejectSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 },
      )
    }

    const { resolution } = parsed.data
    const supabaseAdmin = createAdminClient()

    const { data: caseData, error: caseError } = await supabaseAdmin
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const resolvedAt = new Date().toISOString()

    // 1. Update case status. `resolution` is the customer-facing message;
    // `admin_notes` keeps an internal copy of the same decision.
    await supabaseAdmin
      .from("cases")
      .update({
        status: "rejected",
        resolved_at: resolvedAt,
        resolution,
        admin_notes: resolution,
      })
      .eq("id", caseId)

    // 2. Delete evidence files (paths stored on the case row are the source of
    // truth; the storage folder is keyed by the client-generated id, not caseId)
    const evidencePaths: string[] = caseData.evidence_images_urls ?? []
    if (evidencePaths.length > 0) {
      await supabaseAdmin.storage.from("case-evidence").remove(evidencePaths)
    }

    // 3. Write audit log
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: gate.userId,
      action: "case_status_changed",
      target_table: "cases",
      target_id: caseId,
      previous_value: caseData,
      new_value: { status: "rejected", resolved_at: resolvedAt, resolution },
      notes: `Rejected. Resolution: ${resolution}`,
    })

    // Notify the customer of the decision (fire-and-forget).
    const customer = await getCaseCustomer(supabaseAdmin, caseData.customer_id)
    if (customer.email) {
      await sendCaseRejected({
        to: customer.email,
        customerName: customer.name,
        adminNotes: resolution,
      }).catch((err) => console.error("[reject] email failed:", err))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/reject]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
