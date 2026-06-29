"use client"

import { useEffect, useState } from "react"

import { fetchShippingRates } from "@/lib/checkout/shipping-api"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import type { CheckoutAddress, LiveShippingRate } from "@/lib/checkout/types"

interface UseShippingRatesArgs {
  subtotalCents: number
  address: CheckoutAddress
  cartItems: { variationId: string; quantity: number }[]
  /** Skip fetching when rates were already resolved (returning to this step). */
  initialRates?: LiveShippingRate[] | null
  onRatesFetched?: (rates: LiveShippingRate[]) => void
}

/**
 * Fetches live carrier rates for the cart once (keyed on subtotal). Surfaces
 * loading/error flags, a separate-shipment message, and whether the order
 * qualifies for free shipping.
 */
export function useShippingRates({
  subtotalCents,
  address,
  cartItems,
  initialRates,
  onRatesFetched,
}: UseShippingRatesArgs) {
  const [rates, setRates] = useState<LiveShippingRate[]>(initialRates ?? [])
  const [message, setMessage] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(!initialRates)

  const freeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD * 100

  useEffect(() => {
    if (initialRates) return
    // Wait until the address is fully populated before calling Shippo.
    if (!address?.streetLine1 || !address?.city || !address?.state) return

    let cancelled = false
    fetchShippingRates({
      subtotalCents,
      destinationAddress: address,
      cartItems,
    })
      .then((data) => {
        if (cancelled) return
        if (data.error) {
          setError(data.error)
        } else {
          setRates(data.rates ?? [])
          setMessage(data.message)
          if (data.rates) onRatesFetched?.(data.rates)
        }
        setLoading(false)
      })
      .catch((fetchError) => {
        if (cancelled) return
        console.error(fetchError)
        setError("Could not load shipping rates.")
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotalCents])

  return { rates, freeShipping, message, error, loading }
}
