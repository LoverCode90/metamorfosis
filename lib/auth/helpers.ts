import "server-only"

import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export { mapVerificationStatus, mapDbProfile } from "./mappers"

/**
 * Returns the authenticated user or redirects to /login.
 * Use in Server Components and Server Actions for protected routes.
 */
export async function requireAuth(nextPath?: string): Promise<User> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const target = nextPath
      ? `/login?next=${encodeURIComponent(nextPath)}`
      : "/login"
    redirect(target)
  }

  return user
}

/**
 * Returns the authenticated admin user or redirects.
 * Non-admins are sent to /403; unauthenticated users to /login.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/403")

  return user
}
