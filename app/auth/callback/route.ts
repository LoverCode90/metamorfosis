import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * OAuth callback handler for Google and Apple sign-in.
 * Supabase redirects here after the provider completes authentication.
 *
 * Required in Supabase Dashboard → Auth → URL Configuration:
 *   Redirect URLs: {NEXT_PUBLIC_APP_URL}/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as string
  const next = searchParams.get("next") ?? "/profile"

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      const redirectUrl = next.startsWith("/")
        ? `${origin}${next}`
        : `${origin}/profile`
      return NextResponse.redirect(redirectUrl)
    }
  } else if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const redirectUrl = next.startsWith("/")
        ? `${origin}${next}`
        : `${origin}/profile`
      return NextResponse.redirect(redirectUrl)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
