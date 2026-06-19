import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { DbOrder } from "./types"

export type { DbOrder, DbOrderItem } from "./types"

/**
 * Returns all orders for the given user, newest first.
 */
export async function getUserOrders(userId: string): Promise<DbOrder[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("orders")
    .select(
      `id, square_order_id, status, shipping_method,
       subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents,
       shipping_address, tracking_number, carrier, tracking_url,
       estimated_delivery_date, delivered_at, created_at,
       order_items (
         id, variation_id, quantity, unit_price_cents, discount_cents,
         product_variations (
           name_en, image_url,
           product_translations ( square_product_id )
         )
       )`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getUserOrders]", error)
    return []
  }
  return (data ?? []) as unknown as DbOrder[]
}

/**
 * Returns a single order by ID if it belongs to this user.
 */
export async function getUserOrder(
  orderId: string,
  userId: string,
): Promise<DbOrder | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("orders")
    .select(
      `id, square_order_id, status, shipping_method,
       subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents,
       shipping_address, tracking_number, carrier, tracking_url,
       estimated_delivery_date, delivered_at, created_at,
       order_items (
         id, variation_id, quantity, unit_price_cents, discount_cents,
         product_variations (
           name_en, image_url,
           product_translations ( square_product_id )
         )
       )`,
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("[getUserOrder]", error)
    return null
  }
  return (data as unknown as DbOrder) ?? null
}
