import { NextRequest, NextResponse } from "next/server"
import { VerifyEmailSchema } from "@/lib/validation/schemas"
import { verifyCodeLimiter } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import {
  validateVerificationCode,
  createVerifiedUser,
  cleanupAndWelcome,
} from "@/lib/auth/verify-service"

export async function POST(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"

  // ── Rate limit ────────────────────────────────────────────────────────────
  const { success: withinLimit } = await verifyCodeLimiter.limit(
    `verify:${ipAddress}`,
  )
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many verification attempts. Try again in 15 minutes." },
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

  const parsed = VerifyEmailSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    )
  }

  const { email, code, password } = parsed.data

  // ── Validate verification code ────────────────────────────────────────────
  const validateResult = await validateVerificationCode(email, code)
  if (validateResult.status !== 200 || !validateResult.userData) {
    return NextResponse.json(
      { error: validateResult.error ?? "Verification failed" },
      { status: validateResult.status },
    )
  }

  const { firstName, lastName, fullName } = validateResult.userData

  // ── Create verified user ──────────────────────────────────────────────────
  const createResult = await createVerifiedUser(
    email,
    password,
    fullName,
    firstName,
    lastName,
  )

  if (createResult.status !== 200 || !createResult.userId) {
    return NextResponse.json(
      { error: createResult.error ?? "Account creation failed" },
      { status: createResult.status },
    )
  }

  // ── Sign in & Establish session ───────────────────────────────────────────
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error("[verify-email] signInWithPassword failed:", signInError)
    return NextResponse.json(
      {
        error:
          "Account created successfully, but automatic sign in failed. Please sign in.",
      },
      { status: 500 },
    )
  }

  // ── Cleanup & Welcome email ───────────────────────────────────────────────
  await cleanupAndWelcome(email, firstName)

  return NextResponse.json({ ok: true }, { status: 200 })
}
