const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify"

/**
 * Server-side Cloudflare Turnstile verification.
 * Returns true only when Cloudflare confirms the token is from a human.
 *
 * When TURNSTILE_SECRET_KEY is unset (local dev without keys), verification
 * is skipped so the signup flow remains testable.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false

  const body = new URLSearchParams()
  body.append("secret", secret)
  body.append("response", token)
  if (remoteIp) body.append("remoteip", remoteIp)

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body })
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}
