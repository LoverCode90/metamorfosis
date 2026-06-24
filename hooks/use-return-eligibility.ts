"use client"

import { useEffect, useState } from "react"
import type { DbOrder } from "@/lib/orders/types"
import { RETURN_WINDOW_DAYS } from "@/lib/constants"

/**
 * Whether the "Report a problem" CTA should show: the order is delivered, still
 * inside the return window, and has no existing case. Reads the client clock
 * only after mount to avoid an SSR/client hydration mismatch.
 */
export function useReturnEligibility(order: DbOrder | null): boolean {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
  }, [])

  const isDelivered = order?.status === "delivered"
  // Fall back to updated_at when the Shippo webhook never set delivered_at but
  // the order is already marked delivered, so the return window still applies.
  const deliveredAt = order?.delivered_at
    ? new Date(order.delivered_at)
    : isDelivered && order?.updated_at
      ? new Date(order.updated_at)
      : null
  const isWithinReturnWindow =
    deliveredAt !== null && now !== null
      ? now - deliveredAt.getTime() <= RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000
      : false
  const hasCase = order?.cases && order.cases.length > 0

  return Boolean(isDelivered && isWithinReturnWindow && !hasCase)
}
