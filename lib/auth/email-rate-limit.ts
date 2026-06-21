import "server-only"

/**
 * Per-email throttling shared by every endpoint that sends an email on demand
 * (verification-code resend, password reset).
 *
 * Policy (identical for all callers):
 *   • Max 3 sends per email per rolling hour.
 *   • Exceeding the allowance starts a 20-minute cooldown block.
 *   • After 2 blocks (6 total sends) the email is permanently banned.
 *
 * This module is pure: it reads a {@link EmailLimitState} and returns a
 * {@link EmailLimitDecision}. The caller is responsible for loading/persisting
 * the state (column names differ per table) and for inserting into
 * `banned_emails` when the decision is `ban`.
 */

export const EMAIL_MAX_PER_HOUR = 3
export const EMAIL_BLOCK_MINUTES = 20
export const EMAIL_MAX_BLOCKS = 2

export interface EmailLimitState {
  attemptCount: number
  blockCount: number
  blockedUntil: string | null
  windowStart: string
}

export type EmailLimitDecision =
  /** Within allowance — persist `next`, then send the email. */
  | { action: "allow"; next: EmailLimitState }
  /**
   * Send is denied for `retryAfterMinutes`. When `next` is present a new block
   * was just started and must be persisted; when absent the email was already
   * inside an active block (nothing to persist).
   */
  | { action: "cooldown"; retryAfterMinutes: number; next?: EmailLimitState }
  /** The allowance + block budget is exhausted — ban the email, do not send. */
  | { action: "ban" }

export function evaluateEmailLimit(
  state: EmailLimitState,
  now: number = Date.now(),
): EmailLimitDecision {
  // Already inside an active cooldown block — deny without touching counters.
  if (state.blockedUntil && new Date(state.blockedUntil).getTime() > now) {
    const retryAfterMinutes = Math.ceil(
      (new Date(state.blockedUntil).getTime() - now) / 60000,
    )
    return { action: "cooldown", retryAfterMinutes }
  }

  // Reset the rolling hour window once it has elapsed.
  const hourAgo = now - 60 * 60 * 1000
  let attemptCount = state.attemptCount
  let windowStart = state.windowStart
  if (new Date(windowStart).getTime() < hourAgo) {
    attemptCount = 0
    windowStart = new Date(now).toISOString()
  }

  // Still within the hourly allowance — allow and record the send.
  if (attemptCount < EMAIL_MAX_PER_HOUR) {
    return {
      action: "allow",
      next: {
        attemptCount: attemptCount + 1,
        blockCount: state.blockCount,
        blockedUntil: null,
        windowStart,
      },
    }
  }

  // Allowance exhausted — escalate to a new block, or ban once the budget runs out.
  const blockCount = state.blockCount + 1
  if (blockCount >= EMAIL_MAX_BLOCKS) {
    return { action: "ban" }
  }

  return {
    action: "cooldown",
    retryAfterMinutes: EMAIL_BLOCK_MINUTES,
    next: {
      attemptCount: 0,
      blockCount,
      blockedUntil: new Date(
        now + EMAIL_BLOCK_MINUTES * 60 * 1000,
      ).toISOString(),
      windowStart: new Date(now).toISOString(),
    },
  }
}
