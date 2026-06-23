import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"

const rejectSchema = z.object({
  reason: z.string().optional().default("Case rejected by admin"),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: caseId } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // The admin UI posts with no body, so tolerate an empty request.
    let json: unknown = {}
    try {
      json = await req.json()
    } catch {
      json = {}
    }
    const parsed = rejectSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 },
      )
    }

    const { reason } = parsed.data
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

    // 1. Update case status
    await supabaseAdmin
      .from("cases")
      .update({
        status: "rejected",
        resolved_at: resolvedAt,
        admin_notes: reason,
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
      admin_id: user.id,
      action: "case_status_changed",
      target_table: "cases",
      target_id: caseId,
      previous_value: caseData,
      new_value: { status: "rejected", resolved_at: resolvedAt },
      notes: `Rejected. Reason: ${reason}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/reject]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
