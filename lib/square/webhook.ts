import "server-only"

import crypto from "crypto"

/**
 * Validates the HMAC-SHA256 signature Square sends on every webhook.
 * Uses timingSafeEqual to prevent timing attacks.
 *
 * @see https://developer.squareup.com/docs/webhooks/validate-notifications
 */
export function validateSquareSignature(
  rawBody: string,
  signature: string | null,
  key: string,
): boolean {
  if (!signature) return false
  const hmac = crypto.createHmac("sha256", key)
  hmac.update(rawBody)
  const computed = hmac.digest("base64")
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))
  } catch {
    return false
  }
}
