import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export interface SquareInventoryCountInput {
  catalogObjectId?: string | null
  state?: string | null
  quantity?: string | null
  locationId?: string | null
}

/**
 * Aggregate IN_STOCK quantities per catalog variation ID for a single location.
 * Matches the logic used during full catalog sync.
 */
export function aggregateInventoryCounts(
  counts: SquareInventoryCountInput[],
  locationId: string | undefined,
): Map<string, number> {
  const inventoryCountMap = new Map<string, number>()

  for (const count of counts) {
    if (locationId && count.locationId && count.locationId !== locationId) {
      continue
    }
    if (count.catalogObjectId && count.state === "IN_STOCK" && count.quantity) {
      const current = inventoryCountMap.get(count.catalogObjectId) ?? 0
      inventoryCountMap.set(
        count.catalogObjectId,
        current + Math.floor(parseFloat(count.quantity)),
      )
    }
  }

  return inventoryCountMap
}

/**
 * Write aggregated Square counts into product_variations by square_variation_id.
 * Unknown variation IDs are skipped (logged).
 */
export async function applySquareInventoryCounts(
  countMap: Map<string, number>,
): Promise<void> {
  if (countMap.size === 0) return

  const supabase = createAdminClient()

  for (const [squareVariationId, inventoryCount] of countMap) {
    const { data, error } = await supabase
      .from("product_variations")
      .update({ inventory_count: inventoryCount })
      .eq("square_variation_id", squareVariationId)
      .select("id")

    if (error) {
      console.warn(
        `[inventory-sync] update failed for ${squareVariationId}:`,
        error.message,
      )
      continue
    }

    if (!data || data.length === 0) {
      console.warn(
        `[inventory-sync] no variation for square_variation_id ${squareVariationId}`,
      )
    }
  }
}
