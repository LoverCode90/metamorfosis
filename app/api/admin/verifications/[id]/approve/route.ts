import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendVerificationApproved } from "@/lib/email/resend"

/**
 * POST /api/admin/verifications/[id]/approve
 *
 * Manually approves a pending verification.
 * Writes an audit log entry and sends an approval email to the user.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params

  // ── Admin auth ────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser()

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.id)
    .single()

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const admin = createAdminClient()

  // ── Fetch current profile ─────────────────────────────────────────────────
  const { data: target, error: fetchError } = await admin
    .from("profiles")
    .select("email, full_name, verification_status, role")
    .eq("id", id)
    .single()

  if (fetchError || !target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // ── Update profile ────────────────────────────────────────────────────────
  const { error: updateError } = await admin
    .from("profiles")
    .update({
      verification_status: "approved",
      rejection_reason: null,
    })
    .eq("id", id)

  if (updateError) {
    console.error("[admin/approve] Update failed:", updateError)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }

  // ── Audit log ─────────────────────────────────────────────────────────────
  await admin.from("audit_logs").insert({
    admin_id: adminUser.id,
    action: "verification_approved",
    target_table: "profiles",
    target_id: id,
    previous_value: { verification_status: target.verification_status },
    new_value: { verification_status: "approved" },
  })

  // ── Email (fire-and-forget) ───────────────────────────────────────────────
  sendVerificationApproved({
    to: target.email,
    name: target.full_name,
  }).catch((err) => console.error("[admin/approve] Email failed:", err))

  return NextResponse.json({ ok: true })
}
