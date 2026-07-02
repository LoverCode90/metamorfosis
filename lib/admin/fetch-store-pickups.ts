import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { CANCELABLE_PICKUP_STATUSES } from "@/lib/orders/cancel-pickup-order"
import type {
  StorePickupCancelSource,
  StorePickupHistoryOrder,
  StorePickupOrder,
} from "@/lib/admin/store-pickup-types"

const STORE_PICKUP_SELECT = `
  id, square_order_id, status, total_cents, created_at, updated_at,
  pickup_deadline_at, picked_up_at, guest_email, shipping_address,
  profiles ( first_name, last_name, full_name ),
  order_items (
    quantity,
    product_variations (
      name_en,
      product_translations ( name_en )
    )
  )
`

export async function fetchPendingStorePickups(): Promise<StorePickupOrder[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("orders")
    .select(STORE_PICKUP_SELECT)
    .eq("carrier", "pickup")
    .in("status", [...CANCELABLE_PICKUP_STATUSES])
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[fetchPendingStorePickups]", error)
    return []
  }
  return (data ?? []) as unknown as StorePickupOrder[]
}

export async function fetchFulfilledStorePickups(
  limit = 10,
): Promise<StorePickupOrder[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("orders")
    .select(STORE_PICKUP_SELECT)
    .eq("carrier", "pickup")
    .eq("status", "delivered")
    .order("picked_up_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[fetchFulfilledStorePickups]", error)
    return []
  }
  return (data ?? []) as unknown as StorePickupOrder[]
}

async function resolveCancelSources(
  orderIds: string[],
): Promise<Map<string, StorePickupCancelSource>> {
  const map = new Map<string, StorePickupCancelSource>()
  if (orderIds.length === 0) return map

  const admin = createAdminClient()
  const { data } = await admin
    .from("audit_logs")
    .select("target_id, action")
    .eq("target_table", "orders")
    .in("target_id", orderIds)
    .in("action", ["pickup_deadline_expired", "admin_cancel_pickup"])

  for (const row of data ?? []) {
    if (!row.target_id) continue
    if (row.action === "pickup_deadline_expired") {
      map.set(row.target_id, "deadline_expired")
    } else if (
      row.action === "admin_cancel_pickup" &&
      !map.has(row.target_id)
    ) {
      map.set(row.target_id, "admin_manual")
    }
  }
  return map
}

export async function fetchExpiredStorePickups(
  limit = 10,
): Promise<StorePickupHistoryOrder[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("orders")
    .select(STORE_PICKUP_SELECT)
    .eq("carrier", "pickup")
    .eq("status", "canceled")
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[fetchExpiredStorePickups]", error)
    return []
  }

  const orders = (data ?? []) as unknown as StorePickupOrder[]
  const sources = await resolveCancelSources(orders.map((o) => o.id))

  return orders.map((order) => ({
    ...order,
    cancelSource: sources.get(order.id) ?? "unknown",
  }))
}
