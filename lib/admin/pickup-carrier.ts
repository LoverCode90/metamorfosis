/** Pickup-eligible carrier groups (Shippo supports USPS + DHL Express only). */
export type PickupCarrierKind = "usps" | "dhl_express"

const USPS_ACCOUNT_ENV = "SHIPPO_USPS_CARRIER_ACCOUNT"
const DHL_ACCOUNT_ENV = "SHIPPO_DHL_EXPRESS_CARRIER_ACCOUNT"
const DEFAULT_ACCOUNT_ENV = "SHIPPO_DEFAULT_CARRIER_ACCOUNT"

export function resolvePickupCarrierKind(
  carrier: string | null,
): PickupCarrierKind | null {
  const normalized = (carrier ?? "").toUpperCase()
  if (normalized.includes("DHL") && normalized.includes("EXPRESS")) {
    return "dhl_express"
  }
  if (normalized.includes("USPS")) return "usps"
  return null
}

export function pickupCarrierLabel(kind: PickupCarrierKind): string {
  return kind === "usps" ? "USPS" : "DHL Express"
}

export function pickupCarrierAccountId(kind: PickupCarrierKind): string {
  const specific =
    kind === "usps"
      ? process.env[USPS_ACCOUNT_ENV]?.trim()
      : process.env[DHL_ACCOUNT_ENV]?.trim()
  if (specific) return specific

  const fallback = process.env[DEFAULT_ACCOUNT_ENV]?.trim()
  if (fallback) return fallback

  const envName = kind === "usps" ? USPS_ACCOUNT_ENV : DHL_ACCOUNT_ENV
  throw new Error(
    `Missing Shippo carrier account. Set ${envName} or ${DEFAULT_ACCOUNT_ENV}.`,
  )
}
