import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { DbOrder } from "./types"

export type { DbOrder, DbOrderItem } from "./types"

const ORDER_SELECT = `
  id, square_order_id, status, shipping_method,
  subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents,
  shipping_address, tracking_number, carrier, tracking_url,
  estimated_delivery_date, delivered_at, pickup_deadline_at, picked_up_at,
  created_at, updated_at,
  cases(id, status),
  order_items (
    id, variation_id, quantity, unit_price_cents, discount_cents,
    product_variations (
      name_en, image_url,
      product_translations ( square_product_id, name_en, is_returnable )
    )
  )
`

export interface OrdersPage {
  orders: DbOrder[]
  total: number
}

export async function getUserOrdersPage(
  userId: string,
  limit: number,
  offset: number,
): Promise<OrdersPage> {
  const admin = createAdminClient()
  const { data, error, count } = await admin
    .from("orders")
    .select(ORDER_SELECT, { count: "exact" })
    .eq("user_id", userId)
    // Cancelled orders stay in the DB for auditing — only hidden from the UI.
    // The order_status enum value is "canceled" (single L), not "cancelled".
    .neq("status", "canceled")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("[getUserOrdersPage]", error)
    return { orders: [], total: 0 }
  }
  return { orders: (data ?? []) as unknown as DbOrder[], total: count ?? 0 }
}

export async function getUserOrder(
  orderId: string,
  userId: string,
): Promise<DbOrder | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("[getUserOrder]", error)
    return null
  }
  return (data as unknown as DbOrder) ?? null
}
