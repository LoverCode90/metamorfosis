import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

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

  const redirectUrl = next.startsWith("/")
    ? `${origin}${next}`
    : `${origin}/profile`

  const response = NextResponse.redirect(redirectUrl)
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          } catch {
            // ignore
          }
        },
      },
    },
  )

  if (token_hash && type) {
    if (type === "recovery") {
      // Security: Do NOT verify recovery OTPs here. That would log the user in
      // immediately before they change their password, leaving an active session
      // if they abandon the form. Instead, pass the token to the frontend to
      // consume precisely when submitting the new password.
      const resetUrl = new URL(`${origin}/reset-password`)
      resetUrl.searchParams.set("token_hash", token_hash)
      return NextResponse.redirect(resetUrl.toString())
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "magiclink" | "invite",
    })
    if (!error) {
      return response
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
