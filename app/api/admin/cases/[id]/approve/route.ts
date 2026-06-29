import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"
import { getCaseCustomer } from "@/lib/profile/case-customer"
import { sendCaseApproved } from "@/lib/email/case-notifications"

// Resolution is optional on approval — the admin may add a note for the customer.
const approveSchema = z.object({
  resolution: z.string().trim().optional(),
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
    const parsed = approveSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 },
      )
    }
    const resolution = parsed.data.resolution || null

    const admin = createAdminClient()
    const { data: caseData, error: caseError } = await admin
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const resolvedAt = new Date().toISOString()
    const { error: updateError } = await admin
      .from("cases")
      .update({ status: "approved", resolved_at: resolvedAt, resolution })
      .eq("id", caseId)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update case" },
        { status: 500 },
      )
    }

    await admin.from("audit_logs").insert({
      admin_id: gate.userId,
      action: "case_status_changed",
      target_table: "cases",
      target_id: caseId,
      previous_value: caseData,
      new_value: { status: "approved", resolved_at: resolvedAt, resolution },
      notes: resolution ? `Approved. Note: ${resolution}` : "Approved.",
    })

    const customer = await getCaseCustomer(admin, caseData.customer_id)
    if (customer.email) {
      await sendCaseApproved({
        to: customer.email,
        customerName: customer.name,
        resolution: resolution ?? undefined,
      }).catch((err) => console.error("[approve] email failed:", err))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/approve]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
