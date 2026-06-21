import { createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { VerifyEmailSchema } from "@/lib/validation/schemas"
import { verifyCodeLimiter } from "@/lib/rate-limit"
import { sendWelcomeEmail } from "@/lib/email/resend"

const MAX_ATTEMPTS = 3
const BLOCK_MINUTES = 20
const MAX_BLOCKS = 3

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"

  const { success: withinLimit } = await verifyCodeLimiter.limit(
    `verify-code:${ip}`,
  )
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = VerifyEmailSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    )
  }

  const { email, code, password } = parsed.data
  const admin = createAdminClient()

  // ── Banned? ───────────────────────────────────────────────────────────────
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

  // ── Fetch pending signup ───────────────────────────────────────────────────
  const { data: pending } = await admin
    .from("pending_signups")
    .select("*")
    .eq("email", email)
    .maybeSingle<{
      id: string
      email: string
      full_name: string
      code_hash: string
      expires_at: string
      attempt_count: number
      block_count: number
      blocked_until: string | null
      resend_count: number
      resend_window_start: string
    }>()

  if (!pending) {
    return NextResponse.json(
      {
        error: "Verification code not found or expired. Please sign up again.",
      },
      { status: 400 },
    )
  }

  // ── Expired? ───────────────────────────────────────────────────────────────
  if (new Date(pending.expires_at) < new Date()) {
    await admin.from("pending_signups").delete().eq("email", email)
    return NextResponse.json(
      { error: "Your code has expired. Please sign up again." },
      { status: 400 },
    )
  }

  // ── Currently blocked? ────────────────────────────────────────────────────
  if (pending.blocked_until && new Date(pending.blocked_until) > new Date()) {
    const remainingMs = new Date(pending.blocked_until).getTime() - Date.now()
    const remainingMin = Math.ceil(remainingMs / 60000)
    return NextResponse.json(
      {
        error: `Too many wrong attempts. Try again in ${remainingMin} minute${remainingMin !== 1 ? "s" : ""}.`,
      },
      { status: 429 },
    )
  }

  // ── Verify code ───────────────────────────────────────────────────────────
  const submittedHash = createHash("sha256").update(code).digest("hex")
  const codeCorrect = submittedHash === pending.code_hash

  if (!codeCorrect) {
    const newAttemptCount = pending.attempt_count + 1

    if (newAttemptCount >= MAX_ATTEMPTS) {
      const newBlockCount = pending.block_count + 1

      if (newBlockCount >= MAX_BLOCKS) {
        // Permanently ban
        await admin.from("banned_emails").insert({
          email,
          reason: "too_many_verification_failures",
        })
        await admin.from("pending_signups").delete().eq("email", email)
        return NextResponse.json(
          {
            error:
              "This email has been blocked due to too many failed attempts. Contact support.",
          },
          { status: 403 },
        )
      }

      // Temporary block
      const blockedUntil = new Date(
        Date.now() + BLOCK_MINUTES * 60 * 1000,
      ).toISOString()
      await admin
        .from("pending_signups")
        .update({
          attempt_count: 0,
          block_count: newBlockCount,
          blocked_until: blockedUntil,
        })
        .eq("email", email)

      return NextResponse.json(
        {
          error: `Incorrect code. Too many attempts — try again in ${BLOCK_MINUTES} minutes.`,
        },
        { status: 429 },
      )
    }

    await admin
      .from("pending_signups")
      .update({ attempt_count: newAttemptCount })
      .eq("email", email)

    const remaining = MAX_ATTEMPTS - newAttemptCount
    return NextResponse.json(
      {
        error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      },
      { status: 400 },
    )
  }

  // ── Code correct — create user ────────────────────────────────────────────
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: pending.full_name },
    })

  if (createError) {
    if (createError.message.toLowerCase().includes("already been registered")) {
      await admin.from("pending_signups").delete().eq("email", email)
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      )
    }
    console.error("[verify-email] createUser failed:", createError)
    return NextResponse.json(
      { error: "Account creation failed. Please try again." },
      { status: 500 },
    )
  }

  if (!created.user) {
    return NextResponse.json(
      { error: "Account creation failed. Please try again." },
      { status: 500 },
    )
  }

  // ── Sign in to establish a session ────────────────────────────────────────
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error("[verify-email] signIn after creation failed:", signInError)
    // User created but sign-in failed — they can sign in manually
    await admin.from("pending_signups").delete().eq("email", email)
    return NextResponse.json(
      {
        ok: true,
        redirect: "/login?signup=success",
      },
      { status: 200 },
    )
  }

  await admin.from("pending_signups").delete().eq("email", email)

  // Welcome email — fire-and-forget; account is already created so don't fail the response
  sendWelcomeEmail({
    to: email,
    name: pending.full_name.split(" ")[0],
  }).catch((err) => console.error("[verify-email] welcome email failed:", err))

  return NextResponse.json({ ok: true, redirect: "/profile" }, { status: 200 })
}
