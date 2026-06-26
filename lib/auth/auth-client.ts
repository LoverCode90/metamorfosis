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

/**
 * Verifies a sign-up email with its 4-digit code (and password to sign in).
 * @returns `{ ok }`, an optional `redirect` target, and an `error` on failure.
 */
export async function verifyEmailCode(
  email: string,
  code: string,
  password: string,
): Promise<{ ok: boolean; redirect?: string; error?: string }> {
  const res = await fetch("/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, password }),
  })
  const body = (await res.json().catch(() => ({}))) as {
    ok?: boolean
    redirect?: string
    error?: string
  }
  if (!res.ok) {
    return {
      ok: false,
      error: body.error ?? "Verification failed. Please try again.",
    }
  }
  return { ok: true, redirect: body.redirect }
}

/**
 * Completes a password reset: verifies the recovery token to establish a
 * session, then updates the password.
 * @returns `{ ok }` or a user-facing `error`.
 */
export async function resetPassword(
  tokenHash: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  })
  if (verifyError) {
    return {
      ok: false,
      error:
        "Your reset link is invalid or has expired. Please request a new one.",
    }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    return {
      ok: false,
      error: "Could not update your password. Please try again.",
    }
  }
  return { ok: true }
}

/** Resends the sign-up verification code. */
export async function resendVerificationCode(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/auth/resend-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return {
      ok: false,
      error: body.error ?? "Could not resend code. Please try again.",
    }
  }
  return { ok: true }
}
