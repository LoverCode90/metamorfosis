import "server-only"

import { createShippoClient } from "./client"
import { getShipFromAddress } from "./ship-from"
import type { ShippoParcel } from "@/lib/shipping/build-parcels"
import type { CheckoutAddress, LiveShippingRate } from "@/lib/checkout/types"
import {
  CHECKOUT_CARRIER_LABELS,
  resolveCheckoutCarrierTier,
  type CheckoutCarrierTier,
} from "@/lib/shippo/checkout-carriers"

/** @deprecated Use getShipFromAddress() from ./ship-from */
export const SHIP_FROM_ADDRESS = getShipFromAddress()

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

function buildCheckoutRate(
  tier: CheckoutCarrierTier,
  amountCents: number,
  serviceName: string,
  estimatedDays: number | null,
  shippoRateId: string,
): LiveShippingRate {
  const labels = CHECKOUT_CARRIER_LABELS[tier]
  return {
    carrier: labels.title,
    service_name: serviceName,
    amount_cents: amountCents,
    estimated_days: estimatedDays,
    shippo_rate_id: shippoRateId,
  }
}

/**
 * Returns the cheapest USPS economy and DHL Express rates for checkout.
 * UPS and FedEx are excluded (no carrier pickup support in our workflow).
 */
export async function fetchLiveRates(
  address: CheckoutAddress,
  parcels: ShippoParcel[],
): Promise<LiveShippingRate[]> {
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
    parcels: parcels.map(toSdkParcel),
    async: false,
  })

  const cheapestByTier = new Map<CheckoutCarrierTier, LiveShippingRate>()

  for (const rate of shipment.rates ?? []) {
    const tier = resolveCheckoutCarrierTier({
      provider: rate.provider ?? "",
      serviceName: rate.servicelevel?.name ?? "",
      serviceToken: rate.servicelevel?.token ?? "",
    })
    if (!tier) continue

    const amountCents = amountToCents(rate.amount)
    if (amountCents === null || !rate.objectId) continue

    const candidate = buildCheckoutRate(
      tier,
      amountCents,
      rate.servicelevel?.name ?? CHECKOUT_CARRIER_LABELS[tier].title,
      rate.estimatedDays ?? null,
      rate.objectId,
    )

    const existing = cheapestByTier.get(tier)
    if (!existing || amountCents < existing.amount_cents) {
      cheapestByTier.set(tier, candidate)
    }
  }

  const orderedTiers: CheckoutCarrierTier[] = ["usps_economy", "dhl_express"]
  return orderedTiers
    .map((tier) => cheapestByTier.get(tier))
    .filter((rate): rate is LiveShippingRate => rate !== undefined)
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

  const tier = resolveCheckoutCarrierTier({
    provider: rate.provider ?? "",
    serviceName: rate.servicelevel?.name ?? "",
    serviceToken: rate.servicelevel?.token ?? "",
  })

  return {
    amountCents,
    carrier: tier
      ? CHECKOUT_CARRIER_LABELS[tier].title
      : (rate.provider ?? "Carrier"),
    serviceName: rate.servicelevel?.name ?? "",
    estimatedDays: rate.estimatedDays ?? null,
    shipmentId: rate.shipment,
  }
}
