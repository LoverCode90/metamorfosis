import type { CheckoutAddress, LiveShippingRate } from "@/lib/checkout/types"

export interface ShippingRatesResponse {
  rates?: LiveShippingRate[]
  freeShipping?: boolean
  message?: string
  error?: string
}

interface FetchShippingRatesArgs {
  subtotalCents: number
  destinationAddress: CheckoutAddress
  cartItems: { variationId: string; quantity: number }[]
}

/** Fetches live carrier rates for the cart from the shipping-rates route. */
export async function fetchShippingRates({
  subtotalCents,
  destinationAddress,
  cartItems,
}: FetchShippingRatesArgs): Promise<ShippingRatesResponse> {
  const res = await fetch("/api/checkout/shipping-rates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subtotalCents, destinationAddress, cartItems }),
  })
  return (await res.json()) as ShippingRatesResponse
}
