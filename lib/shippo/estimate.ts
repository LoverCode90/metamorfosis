import "server-only"

import { createShippoClient } from "./client"
import type { Parcel } from "./packing"

export interface EstimateAddress {
  name?: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country?: string
  phone?: string
}

/** Generic small parcel used to estimate a single-item return label cost. */
const DEFAULT_RETURN_PARCEL: Parcel = {
  length: "9",
  width: "6",
  height: "3",
  distanceUnit: "in",
  weight: "1",
  massUnit: "lb",
}

/**
 * Estimates the cheapest return-label cost (in cents) for shipping from the
 * customer back to the store. Returns null on any failure so callers can fall
 * back gracefully rather than block a return.
 */
export async function estimateReturnLabelCost({
  customerAddress,
  storeAddress,
}: {
  customerAddress: EstimateAddress
  storeAddress: EstimateAddress
}): Promise<number | null> {
  try {
    const shippo = createShippoClient()
    const shipment = await shippo.shipments.create({
      addressFrom: {
        name: customerAddress.name ?? "Customer",
        street1: customerAddress.street1,
        street2: customerAddress.street2 || undefined,
        city: customerAddress.city,
        state: customerAddress.state,
        zip: customerAddress.zip,
        country: customerAddress.country ?? "US",
        phone: customerAddress.phone || undefined,
      },
      addressTo: {
        name: storeAddress.name ?? "Metamorfosis Beauty Supply",
        street1: storeAddress.street1,
        city: storeAddress.city,
        state: storeAddress.state,
        zip: storeAddress.zip,
        country: storeAddress.country ?? "US",
        phone: storeAddress.phone || undefined,
      },
      parcels: [DEFAULT_RETURN_PARCEL],
      async: false,
    })

    let cheapestCents: number | null = null
    for (const rate of shipment.rates ?? []) {
      const dollars = parseFloat(rate.amount)
      if (isNaN(dollars)) continue
      const cents = Math.round(dollars * 100)
      if (cheapestCents === null || cents < cheapestCents) {
        cheapestCents = cents
      }
    }
    return cheapestCents
  } catch (err) {
    console.error("[shippo] estimateReturnLabelCost failed:", err)
    return null
  }
}
