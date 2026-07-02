import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { cancelPickupOrder } from "@/lib/orders/cancel-pickup-order"

export interface ExpirePickupOrdersResult {
  processed: number
  failed: number
}

/** Cancel and refund pickup orders past their deadline; restore inventory. */
export async function expirePickupOrders(): Promise<ExpirePickupOrdersResult> {
  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { data: orders, error } = await admin
    .from("orders")
    .select(
      `id, square_order_id, square_payment_id, status, total_cents, carrier, shipping_address,
      order_items ( variation_id, quantity )`,
    )
    .eq("carrier", "pickup")
    .in("status", ["pending", "confirmed", "processing"])
    .lt("pickup_deadline_at", now)

  if (error) {
    throw new Error(`Failed to query expired pickup orders: ${error.message}`)
  }

  let processed = 0
  let failed = 0

  for (const order of orders ?? []) {
    try {
      await cancelPickupOrder(admin, order, {
        reason: "Pickup deadline expired — automatic refund",
        auditAction: "pickup_deadline_expired",
        emailReason:
          "Your pickup order was not collected within 5 days and has been automatically canceled and refunded.",
      })
      processed += 1
    } catch (err) {
      failed += 1
      console.error("[expire-pickup-orders] order failed:", order.id, err)
    }
  }

  return { processed, failed }
}
