import "server-only"

import { retrieveRate } from "@/lib/shippo/live-rates"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"

export interface ResolvedShipping {
  shippingChargedCents: number
  carrier: string
  estimatedDeliveryDate: string | null
  shippoShipmentId: string | null
}

const MS_PER_DAY = 86_400_000

function toDeliveryDate(estimatedDays: number | null): string | null {
  if (estimatedDays == null) return null
  return new Date(Date.now() + estimatedDays * MS_PER_DAY)
    .toISOString()
    .slice(0, 10)
}

/**
 * Resolves the shipping charge server-side (anti-tamper). Carrier rates have
 * their amount re-fetched from Shippo by id; in-store pickup (null id) is free.
 * Meeting the free-shipping threshold zeroes the charge but keeps the carrier.
 * Returns null on a missing/invalid/expired rate id.
 */
export async function resolveShipping(
  shippoRateId: string | null,
  grossSubtotalCents: number,
): Promise<ResolvedShipping | null> {
  const qualifiesForFreeShipping =
    grossSubtotalCents >= FREE_SHIPPING_THRESHOLD * 100

  // In-store pickup — no carrier rate to re-fetch.
  if (shippoRateId === null) {
    return {
      shippingChargedCents: 0,
      carrier: "pickup",
      estimatedDeliveryDate: null,
      shippoShipmentId: null,
    }
  }

  if (typeof shippoRateId !== "string" || shippoRateId.length === 0) {
    return null
  }

  const rate = await retrieveRate(shippoRateId).catch((rateError) => {
    console.error("[resolve-shipping] Rate re-fetch failed:", rateError)
    return null
  })
  if (!rate) return null

  return {
    shippingChargedCents: qualifiesForFreeShipping ? 0 : rate.amountCents,
    carrier: rate.carrier,
    estimatedDeliveryDate: toDeliveryDate(rate.estimatedDays),
    shippoShipmentId: rate.shipmentId,
  }
}
