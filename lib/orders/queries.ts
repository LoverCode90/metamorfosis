import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export interface DbOrderItem {
  id: string
  variation_id: string
  quantity: number
  unit_price_cents: number
  discount_cents: number
  product_variations: {
    name_en: string
    image_url: string | null
    product_translations: {
      square_product_id: string
    } | null
  } | null
}

export interface DbOrder {
  id: string
  square_order_id: string
  status: string
  shipping_method: string
  subtotal_cents: number
  discount_cents: number
  shipping_cents: number
  tax_cents: number
  total_cents: number
  shipping_address: {
    fullName: string
    email: string
    phone: string
    streetLine1: string
    streetLine2: string
    city: string
    state: string
    zip: string
    country: string
  }
  tracking_number: string | null
  carrier: string | null
  tracking_url: string | null
  estimated_delivery_date: string | null
  delivered_at: string | null
  created_at: string
  order_items: DbOrderItem[]
}

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

/**
 * Maps a DB order_status to a 0-based stage index used by the tracking UI.
 * Stages: 0=placed, 1=processing, 2=shipped, 3=delivered
 */
export function orderStatusToStageIndex(status: string): number {
  switch (status) {
    case "pending":
    case "confirmed":
      return 1 // processing
    case "shipped":
      return 2
    case "delivered":
      return 3
    case "cancelled":
    case "refunded":
      return 0
    default:
      return 0
  }
}
