import { createHash, randomInt } from "crypto"
import { promises as dns } from "dns"
import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { SignupSchema } from "@/lib/validation/schemas"
import { verifyTurnstileToken } from "@/lib/auth/turnstile"
import { signupLimiter } from "@/lib/rate-limit"
import { sendVerificationCode } from "@/lib/email/resend"
import disposableDomains from "disposable-email-domains"

const EXTRA_BLOCKED_DOMAINS = new Set([
  "xgshare.com",
  "mailinator.com",
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "throwam.com",
  "yopmail.com",
  "trashmail.com",
  "maildrop.cc",
  "sharklasers.com",
])

const CODE_EXPIRY_MINUTES = 10

async function hasMxRecords(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveMx(domain)
    return records.length > 0
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"

  // ── Rate limit ────────────────────────────────────────────────────────────
  const { success: withinLimit } = await signupLimiter.limit(`signup:${ip}`)
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many signup attempts. Try again in 15 minutes." },
      { status: 429 },
    )
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = SignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    )
  }

  const { email, firstName, lastName, turnstileToken } = parsed.data
  const fullName = `${firstName} ${lastName}`.trim()
  const emailDomain = email.split("@")[1]?.toLowerCase() ?? ""

  // ── Disposable email check — runs before any Supabase call ────────────────
  if (
    EXTRA_BLOCKED_DOMAINS.has(emailDomain) ||
    (disposableDomains as string[]).includes(emailDomain)
  ) {
    return NextResponse.json(
      {
        error:
          "Please use a permanent email address. Disposable email addresses are not allowed.",
      },
      { status: 400 },
    )
  }

  // Secondary check: domain must have MX records (catches unlisted throwaway domains)
  const mxOk = await hasMxRecords(emailDomain)
  if (!mxOk) {
    return NextResponse.json(
      {
        error:
          "Please use a permanent email address. Disposable email addresses are not allowed.",
      },
      { status: 400 },
    )
  }

  // ── Turnstile ─────────────────────────────────────────────────────────────
  const human = await verifyTurnstileToken(turnstileToken ?? null, ip)
  if (!human) {
    return NextResponse.json({ error: "Bot detected" }, { status: 400 })
  }

  const admin = createAdminClient()

  // ── Banned emails check ───────────────────────────────────────────────────
  const { data: banned } = await admin
    .from("banned_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  if (banned) {
    return NextResponse.json(
      {
        error:
          "This email address is not eligible for registration. Contact support if you believe this is an error.",
      },
      { status: 403 },
    )
  }

  // ── Check if a confirmed profile already exists for this email ───────────
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (existingProfile) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    )
  }

  // ── Generate 4-digit code ─────────────────────────────────────────────────
  const code = String(randomInt(1000, 10000)).padStart(4, "0")
  const codeHash = createHash("sha256").update(code).digest("hex")
  const expiresAt = new Date(
    Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000,
  ).toISOString()

  // ── Upsert pending signup (fresh code, reset counters) ────────────────────
  const { error: upsertError } = await admin.from("pending_signups").upsert(
    {
      email,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempt_count: 0,
      block_count: 0,
      blocked_until: null,
      resend_count: 0,
      resend_window_start: new Date().toISOString(),
      resend_block_count: 0,
      resend_blocked_until: null,
      ip,
    },
    { onConflict: "email" },
  )

  if (upsertError) {
    console.error("[signup] pending_signups upsert failed:", upsertError)
    return NextResponse.json(
      { error: "Signup failed. Please try again." },
      { status: 500 },
    )
  }

  // ── Send verification email — awaited so failures surface to the client ───
  try {
    await sendVerificationCode({
      to: email,
      name: firstName,
      code,
      expiresInMinutes: CODE_EXPIRY_MINUTES,
    })
  } catch (err) {
    console.error("[signup] verification email failed:", err)
    // Roll back the pending signup so the user can try again cleanly
    await admin.from("pending_signups").delete().eq("email", email)
    return NextResponse.json(
      {
        error:
          "We could not send a verification email. Please check your address and try again.",
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
