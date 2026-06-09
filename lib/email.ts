// ---------------------------------------------------------------------------
// Transactional email abstraction.
//
// This is a deliberately provider-agnostic seam. The app calls `sendEmail(...)`
// everywhere it needs to fire a transactional message (order receipts,
// verification status changes, profile updates). Today it's backed by a no-op
// "console" transport; swapping to Resend or AWS SES later is a one-file change
// — implement the `EmailTransport` interface and set it as the active transport.
// No call sites need to change.
// ---------------------------------------------------------------------------

export type EmailTemplate =
  | "order.confirmation"
  | "order.canceled"
  | "verification.pending"
  | "verification.approved"
  | "profile.updated"
  | "address.updated"

export interface EmailMessage {
  to: string
  template: EmailTemplate
  /** Arbitrary template variables (order number, name, etc.). */
  data?: Record<string, unknown>
}

export interface EmailResult {
  ok: boolean
  id: string
  template: EmailTemplate
}

/**
 * Implement this interface to back the handler with a real provider.
 *
 * @example Resend
 *   class ResendTransport implements EmailTransport {
 *     async send(m: EmailMessage) {
 *       const res = await resend.emails.send({ ... })
 *       return { ok: true, id: res.id, template: m.template }
 *     }
 *   }
 *
 * @example AWS SES
 *   class SesTransport implements EmailTransport {
 *     async send(m: EmailMessage) {
 *       const res = await ses.sendEmail({ ... })
 *       return { ok: true, id: res.MessageId, template: m.template }
 *     }
 *   }
 */
export interface EmailTransport {
  send(message: EmailMessage): Promise<EmailResult>
}

/** Default transport — logs instead of sending. Replace in production. */
class ConsoleTransport implements EmailTransport {
  async send(message: EmailMessage): Promise<EmailResult> {
    console.log("[v0] sendEmail →", message.template, "to", message.to, message.data ?? {})
    return {
      ok: true,
      id: `local-${Date.now().toString(36)}`,
      template: message.template,
    }
  }
}

// The single active transport. Swap this line to migrate providers.
let activeTransport: EmailTransport = new ConsoleTransport()

/** Override the active transport (e.g. in an app bootstrap or test). */
export function setEmailTransport(transport: EmailTransport) {
  activeTransport = transport
}

/** Fire a transactional email through the active transport. */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  return activeTransport.send(message)
}
