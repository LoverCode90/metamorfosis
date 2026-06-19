import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Server-side Supabase client for Server Components, Route Handlers, and
 * Server Actions. Bound to the request cookie store so sessions persist.
 *
 * Always call `supabase.auth.getUser()` for authorization decisions — it
 * verifies the token against the Auth server, unlike `getSession()`.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component where cookies are read-only.
            // The session refresh is handled by middleware, so this is safe to ignore.
          }
        },
      },
    },
  )
}
