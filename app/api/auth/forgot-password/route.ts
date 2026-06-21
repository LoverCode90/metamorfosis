import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ForgotPasswordSchema } from "@/lib/validation/schemas"

// Always returned — never reveals whether the email exists.
const GENERIC_OK = {
  ok: true,
  message: "If that email has an account, you'll receive a reset link shortly.",
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = ForgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    )
  }

  const { email } = parsed.data
  const admin = createAdminClient()

  // Check existence via profiles table (indexed on email, O(1)).
  // We never reveal the result to the caller.
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (profile) {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      `https://${request.headers.get("host") ?? "localhost:3000"}`

    // Fire-and-forget — failure is logged but we still return the generic message
    // so the caller cannot distinguish success from failure.
    admin.auth
      .resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
      })
      .catch((err) =>
        console.error("[forgot-password] resetPasswordForEmail failed:", err),
      )
  }

  return NextResponse.json(GENERIC_OK, { status: 200 })
}
