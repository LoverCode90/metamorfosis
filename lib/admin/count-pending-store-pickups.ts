import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { CANCELABLE_PICKUP_STATUSES } from "@/lib/orders/cancel-pickup-order"

/** Orders waiting for in-store handoff. */
export async function countPendingStorePickups(): Promise<number> {
  const admin = createAdminClient()
  const { count, error } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("carrier", "pickup")
    .in("status", [...CANCELABLE_PICKUP_STATUSES])

  if (error) {
    console.error("[countPendingStorePickups]", error)
    return 0
  }
  return count ?? 0
}
