import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

export type AdminGate =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string }

/**
 * Verifies the request is from an authenticated admin. Returns the admin's
 * user id on success, or a status + message to forward as the error response.
 */
export async function requireAdmin(
  supabase: SupabaseClient,
): Promise<AdminGate> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, status: 401, error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { ok: false, status: 403, error: "Forbidden" }
  }

  return { ok: true, userId: user.id }
}
