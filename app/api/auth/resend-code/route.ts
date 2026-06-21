import { createHash, randomInt } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ResendCodeSchema } from "@/lib/validation/schemas"
import { sendVerificationCode } from "@/lib/email/resend"

const MAX_RESENDS_PER_HOUR = 3
const CODE_EXPIRY_MINUTES = 10

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = ResendCodeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    )
  }

  const { email } = parsed.data
  const admin = createAdminClient()

  // ── Banned? ───────────────────────────────────────────────────────────────
  const { data: banned } = await admin
    .from("banned_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  if (banned) {
    return NextResponse.json(
      { error: "This email address is not eligible for registration." },
      { status: 403 },
    )
  }

  // ── Fetch pending signup ───────────────────────────────────────────────────
  const { data: pending } = await admin
    .from("pending_signups")
    .select("*")
    .eq("email", email)
    .maybeSingle<{
      id: string
      full_name: string
      resend_count: number
      resend_window_start: string
    }>()

  if (!pending) {
    return NextResponse.json(
      {
        error: "No pending signup found for this email. Please sign up again.",
      },
      { status: 400 },
    )
  }

  // ── Resend rate limit: max 3 per hour per email ───────────────────────────
  const windowStart = new Date(pending.resend_window_start)
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000)

  let resendCount = pending.resend_count
  let newWindowStart = pending.resend_window_start

  if (windowStart < hourAgo) {
    // Window expired — reset
    resendCount = 0
    newWindowStart = new Date().toISOString()
  }

  if (resendCount >= MAX_RESENDS_PER_HOUR) {
    return NextResponse.json(
      {
        error:
          "Too many resend requests. Please wait up to 1 hour before requesting another code.",
      },
      { status: 429 },
    )
  }

  // ── Generate fresh code ───────────────────────────────────────────────────
  const code = String(randomInt(1000, 10000)).padStart(4, "0")
  const codeHash = createHash("sha256").update(code).digest("hex")
  const expiresAt = new Date(
    Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000,
  ).toISOString()

  await admin
    .from("pending_signups")
    .update({
      code_hash: codeHash,
      expires_at: expiresAt,
      attempt_count: 0,
      blocked_until: null,
      resend_count: resendCount + 1,
      resend_window_start: newWindowStart,
    })
    .eq("email", email)

  sendVerificationCode({
    to: email,
    name: pending.full_name.split(" ")[0],
    code,
    expiresInMinutes: CODE_EXPIRY_MINUTES,
  }).catch((err) =>
    console.error("[resend-code] verification email failed:", err),
  )

  return NextResponse.json({ ok: true }, { status: 200 })
}
