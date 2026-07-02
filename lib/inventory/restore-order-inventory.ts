import "server-only"

import type { createAdminClient } from "@/lib/supabase/admin"
import { incrementSquareInventory } from "@/lib/square/inventory-adjust"

type AdminClient = ReturnType<typeof createAdminClient>

interface OrderItemRow {
  variation_id: string
  quantity: number
  product_variations: {
    square_variation_id: string
    inventory_count: number
  } | null
}

/**
 * Restore stock for a canceled/refunded order in Supabase and Square.
 * Idempotency key should be stable per cancel attempt (e.g. order id + action).
 */
export async function restoreOrderInventory(
  admin: AdminClient,
  orderId: string,
  idempotencyKey: string,
): Promise<void> {
  const { data: items, error } = await admin
    .from("order_items")
    .select(
      "variation_id, quantity, product_variations ( square_variation_id, inventory_count )",
    )
    .eq("order_id", orderId)

  if (error) {
    throw new Error(`Failed to load order items: ${error.message}`)
  }

  const rows = (items ?? []) as unknown as OrderItemRow[]
  if (rows.length === 0) return

  const squareLines: { squareVariationId: string; quantity: number }[] = []

  for (const item of rows) {
    const variation = item.product_variations
    if (!variation) continue

    await admin
      .from("product_variations")
      .update({
        inventory_count: variation.inventory_count + item.quantity,
      })
      .eq("id", item.variation_id)

    if (variation.square_variation_id) {
      squareLines.push({
        squareVariationId: variation.square_variation_id,
        quantity: item.quantity,
      })
    }
  }

  if (squareLines.length > 0) {
    await incrementSquareInventory(squareLines, idempotencyKey)
  }
}
