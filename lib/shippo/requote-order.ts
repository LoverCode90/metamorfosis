import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { buildParcels, type ParcelItem } from "@/lib/shipping/build-parcels"
import { fetchLiveRates, retrieveRate } from "@/lib/shippo/live-rates"
import type { CheckoutAddress } from "@/lib/checkout/types"
import type { PackageClass } from "@/lib/square/attributes"

interface VariationRow {
  id: string
  weight_lb: number | null
  product_translations: { package_class: PackageClass } | null
}

export interface RequotedRate {
  rateId: string
  shipmentId: string
  carrier: string
  serviceName: string
}

function normalizeCarrier(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase()
}

function carriersMatch(orderCarrier: string, rateCarrier: string): boolean {
  const a = normalizeCarrier(orderCarrier)
  const b = normalizeCarrier(rateCarrier)
  if (!a || !b) return false
  if (a === b) return true
  if (a.includes("fedex") && b.includes("fedex")) return true
  if (a.includes("usps") && b.includes("usps")) return true
  if (a.includes("ups") && b.includes("ups")) return true
  if (a.includes("dhl") && b.includes("dhl")) return true
  return false
}

/**
 * Builds fresh parcels from order line items, re-quotes Shippo, and returns a
 * current rate id (saved rates expire and may have been quoted with stale FROM).
 */
export async function requoteOrderForLabel(
  orderId: string,
): Promise<RequotedRate> {
  const admin = createAdminClient()
  const { data: order, error } = await admin
    .from("orders")
    .select(
      `id, carrier, shipping_method, shipping_address,
      order_items ( variation_id, quantity )`,
    )
    .eq("id", orderId)
    .single()

  if (error || !order) {
    throw new Error("Order not found")
  }

  const shippingMethod = (order.shipping_method ?? "").toLowerCase()
  const carrier = (order.carrier ?? "").toLowerCase()
  if (shippingMethod.includes("pickup") || carrier.includes("pickup")) {
    throw new Error("In-store pickup orders do not need a shipping label")
  }

  const address = order.shipping_address as CheckoutAddress | null
  if (!address?.streetLine1 || !address.zip) {
    throw new Error("Order is missing a valid shipping address")
  }

  const items = order.order_items ?? []
  if (items.length === 0) {
    throw new Error("Order has no items to ship")
  }

  const variationIds = items.map(
    (item: { variation_id: string }) => item.variation_id,
  )
  const { data: variationRows } = await admin
    .from("product_variations")
    .select("id, weight_lb, product_translations(package_class)")
    .in("id", variationIds)

  const rowsById = new Map(
    ((variationRows ?? []) as unknown as VariationRow[]).map((row) => [
      row.id,
      row,
    ]),
  )

  const parcelItems: ParcelItem[] = items.map(
    (item: { variation_id: string; quantity: number }) => {
      const row = rowsById.get(item.variation_id)
      return {
        packageClass: row?.product_translations?.package_class ?? "small",
        weightLb: row?.weight_lb ?? null,
        quantity: item.quantity,
      }
    },
  )

  const parcels = buildParcels(parcelItems)
  if (parcels.length === 0) {
    throw new Error(
      "These items cannot be packed for carrier shipping. Contact support.",
    )
  }

  const rates = await fetchLiveRates(address, parcels)
  if (rates.length === 0) {
    throw new Error("No shipping rates available for this order")
  }

  const matched =
    rates.find(
      (rate) =>
        rate.shippo_rate_id && carriersMatch(order.carrier, rate.carrier),
    ) ?? rates[0]

  if (!matched.shippo_rate_id) {
    throw new Error("Could not resolve a Shippo rate for this order")
  }

  const retrieved = await retrieveRate(matched.shippo_rate_id)
  if (!retrieved?.shipmentId) {
    throw new Error("Could not resolve Shippo shipment for the selected rate")
  }

  return {
    rateId: matched.shippo_rate_id,
    shipmentId: retrieved.shipmentId,
    carrier: matched.carrier,
    serviceName: matched.service_name,
  }
}
