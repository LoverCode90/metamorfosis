import "server-only"

import { EMAIL_ADDRESSES, EMAIL_SHIP_FROM_DEFAULT } from "@/lib/email/addresses"

/** Shippo address_from shape — seller / warehouse origin. */
export interface ShipFromAddress {
  name: string
  company: string
  street1: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  email: string
}

function parseEmailFromEnv(): string {
  const direct = process.env.SHIPPO_FROM_EMAIL?.trim()
  if (direct) return direct

  const emailFrom = process.env.EMAIL_FROM ?? ""
  const angleMatch = emailFrom.match(/<([^>]+)>/)
  if (angleMatch?.[1]) return angleMatch[1].trim()
  if (emailFrom.includes("@")) return emailFrom.trim()

  return EMAIL_SHIP_FROM_DEFAULT
}

/**
 * Canonical ship-from address for all Shippo shipments (checkout + admin labels).
 * Defaults: Metamorfosis LLC — Ontario, CA store.
 */
export function getShipFromAddress(): ShipFromAddress {
  return {
    name: process.env.SHIPPO_FROM_NAME?.trim() || "Alexandra Alvarez",
    company: process.env.SHIPPO_FROM_COMPANY?.trim() || "Metamorfosis LLC",
    street1: process.env.SHIPPO_FROM_STREET1?.trim() || "211 W B St",
    city: "Ontario",
    state: "CA",
    zip: "91762",
    country: "US",
    phone: process.env.SHIPPO_FROM_PHONE?.trim() || "+19092780535",
    email: parseEmailFromEnv(),
  }
}

export function validateShipFromConfig():
  | { ok: true; address: ShipFromAddress }
  | { ok: false; missing: string[] } {
  const address = getShipFromAddress()
  const missing: string[] = []
  if (!address.street1) missing.push("SHIPPO_FROM_STREET1")
  if (!address.phone) missing.push("SHIPPO_FROM_PHONE")
  if (!address.email) missing.push("SHIPPO_FROM_EMAIL (or EMAIL_FROM)")
  if (missing.length > 0) return { ok: false, missing }
  return { ok: true, address }
}

export function shipFromConfigErrorMessage(missing: string[]): string {
  return (
    `Seller ship-from address is incomplete. Set in Vercel: ${missing.join(", ")}. ` +
    "USPS requires seller phone and email to purchase shipping labels."
  )
}

/** Email used for admin pickup confirmations (store owner). */
export function getStoreOwnerNotificationEmail(): string {
  return (
    process.env.ADMIN_PICKUP_NOTIFY_EMAIL?.trim() || EMAIL_ADDRESSES.adminOps
  )
}
