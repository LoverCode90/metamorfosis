import { NextRequest, NextResponse } from "next/server"
import { SignupSchema } from "@/lib/validation/schemas"
import { verifyTurnstileToken } from "@/lib/auth/turnstile"
import { signupLimiter } from "@/lib/rate-limit"
import {
  checkDisposableEmail,
  checkExistingAccount,
  processSignupSession,
} from "@/lib/auth/signup-service"

export async function POST(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"

  // ── Rate limit ────────────────────────────────────────────────────────────
  const { success: withinLimit } = await signupLimiter.limit(
    `signup:${ipAddress}`,
  )
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

  // ── Disposable email check ────────────────────────────────────────────────
  const isDisposable = await checkDisposableEmail(emailDomain)
  if (isDisposable) {
    return NextResponse.json(
      {
        error:
          "Please use a permanent email address. Disposable email addresses are not allowed.",
      },
      { status: 400 },
    )
  }

  // ── Turnstile ─────────────────────────────────────────────────────────────
  const human = await verifyTurnstileToken(turnstileToken ?? null, ipAddress)
  if (!human) {
    return NextResponse.json({ error: "Bot detected" }, { status: 400 })
  }

  // ── Banned & Existing account check ───────────────────────────────────────
  const { banned, exists } = await checkExistingAccount(email)

  if (banned) {
    return NextResponse.json(
      {
        error:
          "This email address is not eligible for registration. Contact support if you believe this is an error.",
      },
      { status: 403 },
    )
  }

  if (exists) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please sign in." },
      { status: 409 },
    )
  }

  // ── Process signup session ────────────────────────────────────────────────
  const result = await processSignupSession(
    email,
    fullName,
    firstName,
    lastName,
    ipAddress,
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Signup failed. Please try again." },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
