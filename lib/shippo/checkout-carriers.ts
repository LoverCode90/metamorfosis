/** Checkout shipping tiers shown to customers. */
export type CheckoutCarrierTier = "usps_economy" | "dhl_express"

export const CHECKOUT_CARRIER_LABELS: Record<
  CheckoutCarrierTier,
  { title: string; subtitle: string }
> = {
  usps_economy: {
    title: "USPS Economy",
    subtitle: "Pay less — delivery may take a few more days",
  },
  dhl_express: {
    title: "DHL Express",
    subtitle: "Pay more — faster delivery to your door",
  },
}

interface RateCarrierFields {
  provider: string
  serviceName: string
  serviceToken: string
}

function combinedCarrierText(fields: RateCarrierFields): string {
  return `${fields.provider} ${fields.serviceName} ${fields.serviceToken}`.toUpperCase()
}

/** True when the Shippo rate is a USPS domestic service. */
export function isUspsCheckoutRate(fields: RateCarrierFields): boolean {
  return combinedCarrierText(fields).includes("USPS")
}

/** True when the Shippo rate is DHL Express (pickup-eligible). */
export function isDhlExpressCheckoutRate(fields: RateCarrierFields): boolean {
  const combined = combinedCarrierText(fields)
  return combined.includes("DHL") && combined.includes("EXPRESS")
}

/** Maps a Shippo rate to a checkout tier, if offered at checkout. */
export function resolveCheckoutCarrierTier(
  fields: RateCarrierFields,
): CheckoutCarrierTier | null {
  if (isDhlExpressCheckoutRate(fields)) return "dhl_express"
  if (isUspsCheckoutRate(fields)) return "usps_economy"
  return null
}
