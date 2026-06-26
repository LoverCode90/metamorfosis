"use client"

import { useEffect, useState } from "react"

import { fetchShippingRates } from "@/lib/checkout/shipping-api"
import type { CheckoutAddress, ShippingRate } from "@/lib/checkout/types"

interface UseShippingRatesArgs {
  subtotalCents: number
  address: CheckoutAddress
  items: { variationId: string; quantity: number }[]
  /** Skip fetching when rates were already resolved (returning to this step). */
  initialRates?: ShippingRate[] | null
  onRatesFetched?: (rates: ShippingRate[]) => void
}

/**
 * Fetches shipping rates for the cart once (keyed on subtotal). Surfaces a
 * loading flag, an oversized-package message, and a free-shipping note.
 */
export function useShippingRates({
  subtotalCents,
  address,
  items,
  initialRates,
  onRatesFetched,
}: UseShippingRatesArgs) {
  const [rates, setRates] = useState<ShippingRate[]>(initialRates ?? [])
  const [freeNote, setFreeNote] = useState<string | undefined>()
  const [oversizedMsg, setOversizedMsg] = useState<string | undefined>()
  const [loading, setLoading] = useState(!initialRates)

  useEffect(() => {
    if (initialRates) return

    let cancelled = false
    fetchShippingRates({ subtotalCents, address, items })
      .then((data) => {
        if (cancelled) return
        if (data.oversized) {
          setOversizedMsg(data.message)
          setRates([])
        } else {
          setRates(data.rates ?? [])
          setFreeNote(data.freeThresholdNote)
          if (data.rates) onRatesFetched?.(data.rates)
        }
        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotalCents])

  return { rates, freeNote, oversizedMsg, loading }
}
