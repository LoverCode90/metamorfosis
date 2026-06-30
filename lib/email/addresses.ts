/**
 * Official Metamorfosis LLC email addresses (Zoho).
 * Single source of truth — import from here, never hardcode elsewhere.
 */
export const EMAIL_ADDRESSES = {
  /** Automated transactional emails to customers (FROM header). */
  noReply: "no-reply@metamorfosisllc.com",
  /** Customer support — reply-to, website contact, public mailto links. */
  customerSupport: "hello@metamorfosisllc.com",
  /** Admin / owner — critical ops, pickups, Shippo seller email, Square alerts. */
  adminOps: "contact@metamorfosisllc.com",
  /** Purchasing and salon supplies (Shein, AliExpress, etc.). */
  supplies: "supplies@metamorfosisllc.com",
  /** Social media and ads accounts. */
  marketing: "marketing@metamorfosisllc.com",
  /** Premium distributors and B2B partners. */
  partners: "partners@metamorfosisllc.com",
} as const

/** Resend FROM header for all outbound transactional mail. */
export const EMAIL_FROM = `Metamorfosis <${EMAIL_ADDRESSES.noReply}>`

/** Default Reply-To — routes customer replies to support. */
export const EMAIL_REPLY_TO = EMAIL_ADDRESSES.customerSupport

/** Internal alerts to the store owner (pickups, critical ops). */
export const EMAIL_ADMIN_NOTIFY = EMAIL_ADDRESSES.adminOps

/** Shippo ship-from seller email when env vars are unset. */
export const EMAIL_SHIP_FROM_DEFAULT = EMAIL_ADDRESSES.adminOps

/** `mailto:` link for public-facing contact buttons. */
export function customerSupportMailtoLink(subject?: string): string {
  if (!subject) return `mailto:${EMAIL_ADDRESSES.customerSupport}`
  return `mailto:${EMAIL_ADDRESSES.customerSupport}?subject=${encodeURIComponent(subject)}`
}
