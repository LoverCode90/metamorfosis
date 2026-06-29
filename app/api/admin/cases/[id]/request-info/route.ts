import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"

/**
 * Records that the admin requested more information from the customer. The
 * actual message is sent from the admin's own Zoho client via a mailto link on
 * the client — this route only persists the timestamp + audit trail.
 */
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

    const admin = createAdminClient()
    const { data: caseData, error: caseError } = await admin
      .from("cases")
      .select("id, status")
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const requestedAt = new Date().toISOString()
    // Keep the case visible in the review queue while awaiting the reply.
    const nextStatus = caseData.status === "open" ? "pending_review" : undefined

    const { error: updateError } = await admin
      .from("cases")
      .update({
        more_info_requested_at: requestedAt,
        ...(nextStatus ? { status: nextStatus } : {}),
      })
      .eq("id", caseId)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update case" },
        { status: 500 },
      )
    }

    await admin.from("audit_logs").insert({
      admin_id: gate.userId,
      action: "case_more_info_requested",
      target_table: "cases",
      target_id: caseId,
      notes: "Requested more info from customer (mailto).",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/request-info]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
