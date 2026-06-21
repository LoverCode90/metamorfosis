import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SignupSchema } from "@/lib/validation/schemas"
import { verifyTurnstileToken } from "@/lib/auth/turnstile"
import disposableDomains from "disposable-email-domains"

const EXTRA_BLOCKED_DOMAINS = new Set([
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

export async function POST(request: NextRequest) {
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

  const { email, password, fullName, turnstileToken } = parsed.data

  const emailDomain = email.split("@")[1]?.toLowerCase() ?? ""
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

  const ip = request.headers.get("x-forwarded-for")
  const human = await verifyTurnstileToken(turnstileToken, ip)
  if (!human) {
    return NextResponse.json({ error: "Bot detected" }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
