"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

/**
 * Prevents an authenticated user from landing back on the sign-in page via the
 * browser back button / back gesture. On mount (and on every popstate) it
 * checks the session and redirects logged-in users away. Renders nothing.
 */
export function SignInGuard({
  redirectTo = "/profile",
}: {
  redirectTo?: string
}) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function redirectIfAuthed() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        window.history.pushState(null, "", window.location.href)
        router.replace(redirectTo)
      }
    }

    redirectIfAuthed()
    window.addEventListener("popstate", redirectIfAuthed)
    return () => window.removeEventListener("popstate", redirectIfAuthed)
  }, [router, redirectTo])

  return null
}
