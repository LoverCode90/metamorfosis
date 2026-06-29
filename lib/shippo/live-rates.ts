import "server-only"

import { createShippoClient } from "./client"
import type { ShippoParcel } from "@/lib/shipping/build-parcels"
import type { CheckoutAddress, LiveShippingRate } from "@/lib/checkout/types"

/** Ship-from origin — Metamorfosis, Ontario CA. */
export const SHIP_FROM_ADDRESS = {
  name: "Metamorfosis Beauty Supply",
  street1: "211 W B St",
  city: "Ontario",
  state: "CA",
  zip: "91762",
  country: "US",
  phone: process.env.SHIPPO_FROM_PHONE ?? "",
}

/** Normalizes a Shippo provider string to one of our supported carriers. */
function canonicalCarrier(provider: string): string | null {
  const upper = provider.toUpperCase()
  if (upper.includes("USPS")) return "USPS"
  if (upper.includes("FEDEX")) return "FedEx"
  if (upper.includes("DHL")) return "DHL"
  if (upper.includes("UPS")) return "UPS"
  return null
}

function toSdkParcel(parcel: ShippoParcel) {
  return {
    length: parcel.length,
    width: parcel.width,
    height: parcel.height,
    distanceUnit: parcel.distance_unit,
    weight: parcel.weight,
    massUnit: parcel.mass_unit,
  }
}

function amountToCents(amount: string): number | null {
  const dollars = parseFloat(amount)
  if (!Number.isFinite(dollars)) return null
  return Math.round(dollars * 100)
}

/**
 * Creates a Shippo shipment for the given parcels and returns the cheapest
 * rate per supported carrier (USPS, UPS, FedEx, DHL), sorted by price asc.
 */
export async function fetchLiveRates(
  address: CheckoutAddress,
  parcels: ShippoParcel[],
): Promise<LiveShippingRate[]> {
  const shippo = createShippoClient()
  const shipment = await shippo.shipments.create({
    addressFrom: SHIP_FROM_ADDRESS,
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
    parcels: parcels.map(toSdkParcel),
    async: false,
  })

  const cheapestByCarrier = new Map<string, LiveShippingRate>()
  for (const rate of shipment.rates ?? []) {
    const carrier = canonicalCarrier(rate.provider)
    if (!carrier) continue
    const amountCents = amountToCents(rate.amount)
    if (amountCents === null) continue
    const existing = cheapestByCarrier.get(carrier)
    if (!existing || amountCents < existing.amount_cents) {
      cheapestByCarrier.set(carrier, {
        carrier,
        service_name: rate.servicelevel?.name ?? carrier,
        amount_cents: amountCents,
        estimated_days: rate.estimatedDays ?? null,
        shippo_rate_id: rate.objectId,
      })
    }
  }

  return [...cheapestByCarrier.values()].sort(
    (left, right) => left.amount_cents - right.amount_cents,
  )
}

export interface RetrievedRate {
  amountCents: number
  carrier: string
  serviceName: string
  estimatedDays: number | null
  shipmentId: string
}

/**
 * Re-fetches a single rate by id. Anti-tamper: the charged shipping amount
 * comes from Shippo here, never from the client.
 */
export async function retrieveRate(
  rateId: string,
): Promise<RetrievedRate | null> {
  const shippo = createShippoClient()
  const rate = await shippo.rates.get(rateId)
  const amountCents = amountToCents(rate.amount)
  if (amountCents === null) return null
  return {
    amountCents,
    carrier: canonicalCarrier(rate.provider) ?? rate.provider,
    serviceName: rate.servicelevel?.name ?? "",
    estimatedDays: rate.estimatedDays ?? null,
    shipmentId: rate.shipment,
  }
}
