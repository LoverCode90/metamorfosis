import { createClient } from "@/lib/supabase/client"

/**
 * Signs in with email/password via Supabase.
 * @returns `{ error: true }` when the credentials are rejected.
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ error: boolean }> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: Boolean(error) }
}

/**
 * Requests a password-reset email.
 * @returns `{ ok }` and, on failure, a user-facing `error` message.
 */
export async function requestPasswordReset(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return {
      ok: false,
      error: body.error ?? "Something went wrong. Please try again.",
    }
  }
  return { ok: true }
}
