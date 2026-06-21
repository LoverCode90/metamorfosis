import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { AdminRejectSchema } from "@/lib/validation/schemas"
import { sendVerificationRejected } from "@/lib/email/resend"

/**
 * POST /api/admin/verifications/[id]/reject
 *
 * Body: { reason: string }
 *
 * Manually rejects a verification. Persists the rejection reason,
 * writes an audit log, and emails the user.
 */
export async function POST(
  request: NextRequest,
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

  // ── Validate body ─────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = AdminRejectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    )
  }
  const { reason } = parsed.data

  const admin = createAdminClient()

  // ── Fetch current profile ─────────────────────────────────────────────────
  const { data: target, error: fetchError } = await admin
    .from("profiles")
    .select("email, full_name, verification_status")
    .eq("id", id)
    .single()

  if (fetchError || !target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // ── Update profile ────────────────────────────────────────────────────────
  const { error: updateError } = await admin
    .from("profiles")
    .update({
      verification_status: "rejected",
      rejection_reason: reason,
    })
    .eq("id", id)

  if (updateError) {
    console.error("[admin/reject] Update failed:", updateError)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }

  // ── Audit log ─────────────────────────────────────────────────────────────
  await admin.from("audit_logs").insert({
    admin_id: adminUser.id,
    action: "verification_rejected",
    target_table: "profiles",
    target_id: id,
    previous_value: { verification_status: target.verification_status },
    new_value: { verification_status: "rejected", rejection_reason: reason },
  })

  // ── Email (fire-and-forget) ───────────────────────────────────────────────
  sendVerificationRejected({
    to: target.email,
    name: target.full_name,
    reason,
  }).catch((err) => console.error("[admin/reject] Email failed:", err))

  return NextResponse.json({ ok: true })
}
