import { NextRequest, NextResponse } from "next/server"

/**
 * Supabase Custom Email Hook
 *
 * This endpoint intercepts all automated emails that Supabase attempts to send
 * (e.g., as a side-effect of calling generateLink). By returning a 200 OK
 * without actually sending anything, we force Supabase to discard its built-in
 * emails. We handle all real email delivery explicitly via Resend in our own API routes.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization")
  const expectedSecret = process.env.SUPABASE_EMAIL_HOOK_SECRET

  // Basic authorization to ensure only Supabase can call this hook
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // We intentionally ignore the request body and do not send an email.
  return NextResponse.json({ success: true }, { status: 200 })
}
