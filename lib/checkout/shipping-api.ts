import type { CheckoutAddress, ShippingRate } from "@/lib/checkout/types"

export interface ShippingRatesResponse {
  rates?: ShippingRate[]
  freeThresholdNote?: string
  oversized?: boolean
  message?: string
}

interface FetchShippingRatesArgs {
  subtotalCents: number
  address: CheckoutAddress
  items: { variationId: string; quantity: number }[]
}

/** Fetches live shipping rates (or an oversized notice) for the cart. */
export async function fetchShippingRates({
  subtotalCents,
  address,
  items,
}: FetchShippingRatesArgs): Promise<ShippingRatesResponse> {
  const res = await fetch("/api/checkout/shipping-rates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subtotalCents, address, items }),
  })
  return (await res.json()) as ShippingRatesResponse
}
