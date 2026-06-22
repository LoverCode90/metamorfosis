import { createHash, randomInt } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ResendCodeSchema } from "@/lib/validation/schemas"
import { sendVerificationCode } from "@/lib/email/resend"
import { evaluateEmailLimit } from "@/lib/auth/email-rate-limit"

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
      first_name: string | null
      resend_count: number
      resend_window_start: string
      resend_block_count: number
      resend_blocked_until: string | null
    }>()

  if (!pending) {
    return NextResponse.json(
      {
        error: "No pending signup found for this email. Please sign up again.",
      },
      { status: 400 },
    )
  }

  // ── Resend rate limit: 3/hour, 20-min block, ban after 2 blocks ───────────
  const decision = evaluateEmailLimit({
    attemptCount: pending.resend_count,
    blockCount: pending.resend_block_count,
    blockedUntil: pending.resend_blocked_until,
    windowStart: pending.resend_window_start,
  })

  if (decision.action === "ban") {
    await admin.from("banned_emails").insert({
      email,
      reason: "too_many_resend_requests",
    })
    await admin.from("pending_signups").delete().eq("email", email)
    return NextResponse.json(
      {
        error:
          "This email has been blocked due to too many requests. Contact support.",
      },
      { status: 403 },
    )
  }

  if (decision.action === "cooldown") {
    if (decision.next) {
      await admin
        .from("pending_signups")
        .update({
          resend_count: decision.next.attemptCount,
          resend_block_count: decision.next.blockCount,
          resend_blocked_until: decision.next.blockedUntil,
          resend_window_start: decision.next.windowStart,
        })
        .eq("email", email)
    }
    return NextResponse.json(
      {
        error: `Too many resend requests. Try again in ${decision.retryAfterMinutes} minute${decision.retryAfterMinutes !== 1 ? "s" : ""}.`,
      },
      { status: 429 },
    )
  }

  // ── Allowed: generate fresh code and persist the send ─────────────────────
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
      resend_count: decision.next.attemptCount,
      resend_block_count: decision.next.blockCount,
      resend_blocked_until: decision.next.blockedUntil,
      resend_window_start: decision.next.windowStart,
    })
    .eq("email", email)

  sendVerificationCode({
    to: email,
    name: pending.first_name ?? pending.full_name.split(" ")[0] ?? "",
    code,
    expiresInMinutes: CODE_EXPIRY_MINUTES,
  }).catch((err) =>
    console.error("[resend-code] verification email failed:", err),
  )

  return NextResponse.json({ ok: true }, { status: 200 })
}
