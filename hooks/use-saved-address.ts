"use client"

import { useEffect, useRef, useState } from "react"

import type { CheckoutAddress } from "@/lib/checkout/types"

interface UseSavedAddressOptions {
  /** Only authenticated users have a saved address to fetch. */
  isAuthenticated: boolean
  /** Gate the fetch (e.g. skip when returning from a later step). */
  enabled: boolean
  /** Called once with the saved address when one is found. */
  onLoaded?: (address: CheckoutAddress) => void
}

interface UseSavedAddressResult {
  savedAddress: CheckoutAddress | null
  isLoading: boolean
}

/**
 * Fetches the authenticated user's default saved address exactly once.
 * Returns `{ savedAddress: null }` when unauthenticated, disabled, or none
 * exists. Pass a stable `onLoaded` (e.g. from `useCallback`) to pre-fill a form.
 */
export function useSavedAddress({
  isAuthenticated,
  enabled,
  onLoaded,
}: UseSavedAddressOptions): UseSavedAddressResult {
  const [savedAddress, setSavedAddress] = useState<CheckoutAddress | null>(null)
  const [isLoading, setIsLoading] = useState(isAuthenticated && enabled)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !enabled || fetchedRef.current) return
    fetchedRef.current = true

    fetch("/api/addresses/default")
      .then((r) => r.json())
      .then(({ address }: { address: CheckoutAddress | null }) => {
        if (address) {
          setSavedAddress(address)
          onLoaded?.(address)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [isAuthenticated, enabled, onLoaded])

  return { savedAddress, isLoading }
}
