import { PICKUP_WINDOW_DAYS } from "@/lib/orders/order-status-config"

/** Pickup deadline from DB column or created_at + window. */
export function resolvePickupDeadline(
  createdAt: string,
  pickupDeadlineAt: string | null,
): Date {
  if (pickupDeadlineAt) return new Date(pickupDeadlineAt)
  return new Date(
    new Date(createdAt).getTime() + PICKUP_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  )
}
