import "server-only"

import { createShippoClient } from "./client"
import { getShipFromAddress } from "./ship-from"
import type { Parcel } from "./packing"
import type { CheckoutAddress } from "@/lib/checkout/types"

export interface ShippoRates {
  /** Amount in cents, or null if Shippo returned no rate for this service */
  standardCents: number | null
  expressCents: number | null
  overnightCents: number | null
}

/** @deprecated Use getShipFromAddress() from ./ship-from */
export const FROM_ADDRESS = getShipFromAddress()

/**
 * Service level token → our shipping tier key. Shippo returns many carriers;
 * we map USPS, UPS, and FedEx service levels into standard/express/overnight.
 */
const TOKEN_MAP: Record<string, keyof ShippoRates> = {
  // USPS
  usps_first: "standardCents",
  usps_priority: "standardCents",
  usps_priority_express: "expressCents",
  usps_express: "expressCents",
  usps_express_mail: "expressCents",
  usps_overnight: "overnightCents",
  // UPS
  ups_ground: "standardCents",
  ups_3_day_select: "expressCents",
  ups_second_day_air: "expressCents",
  ups_next_day_air_saver: "overnightCents",
  ups_next_day_air: "overnightCents",
  // FedEx
  fedex_ground: "standardCents",
  fedex_express_saver: "expressCents",
  fedex_2_day: "expressCents",
  fedex_standard_overnight: "overnightCents",
  fedex_priority_overnight: "overnightCents",
}

/**
 * Calls Shippo to retrieve live shipping rates.
 *
 * Runs `async: false` so the shipment response already contains rates.
 * Returns null amounts for any service level Shippo didn't quote.
 */
export async function fetchShippoRates(
  address: CheckoutAddress,
  parcels: Parcel[],
): Promise<ShippoRates> {
  const shippo = createShippoClient()

  const shipment = await shippo.shipments.create({
    addressFrom: getShipFromAddress(),
    addressTo: {
      name: address.fullName,
      street1: address.streetLine1,
      street2: address.streetLine2 || undefined,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: "US",
      phone: address.phone,
    },
    parcels,
    async: false,
  })

  const result: ShippoRates = {
    standardCents: null,
    expressCents: null,
    overnightCents: null,
  }

  for (const rate of shipment.rates ?? []) {
    const token = rate.servicelevel.token ?? ""
    const key = TOKEN_MAP[token]
    if (!key) continue

    const dollars = parseFloat(rate.amount)
    if (isNaN(dollars)) continue
    const cents = Math.round(dollars * 100)

    // Keep the cheapest match for each tier
    const existing = result[key]
    if (existing === null || cents < existing) {
      result[key] = cents
    }
  }

  return result
}
