import "server-only"

import {
  aggregateInventoryCounts,
  applySquareInventoryCounts,
  type SquareInventoryCountInput,
} from "./inventory-sync"

interface InventoryCountUpdatedEvent {
  type?: string
  data?: {
    type?: string
    object?: {
      inventory_counts?: SquareInventoryCountInput[]
    }
  }
}

/**
 * Handle Square `inventory.count.updated` — refresh Supabase counts for
 * variations at SQUARE_LOCATION_ID.
 */
export async function handleInventoryCountUpdated(
  event: InventoryCountUpdatedEvent,
): Promise<void> {
  const counts = event.data?.object?.inventory_counts
  if (!counts || counts.length === 0) {
    console.warn("[inventory-webhook] event missing inventory_counts")
    return
  }

  const locationId = process.env.SQUARE_LOCATION_ID
  const countMap = aggregateInventoryCounts(counts, locationId)
  await applySquareInventoryCounts(countMap)
}
