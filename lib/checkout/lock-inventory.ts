import "server-only"

import { NextResponse } from "next/server"
import type { createAdminClient } from "@/lib/supabase/admin"
import type { CheckoutPayload, PlaceOrderResponse } from "@/lib/checkout/types"

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Checks Supabase inventory_count and briefly locks variation rows via RPC
 * (SELECT … FOR UPDATE NOWAIT). The lock is released when the RPC returns —
 * it does NOT span payment or POS sales. Authoritative cross-channel commit is
 * the post-charge Square inventory adjustment; Supabase counts refresh via the
 * inventory.count.updated webhook (not a local decrement at persist time).
 */
export async function lockInventory(
  admin: AdminClient,
  items: CheckoutPayload["items"],
): Promise<NextResponse<PlaceOrderResponse> | null> {
  const { data: lockResult, error: lockError } = await admin.rpc(
    "check_and_lock_inventory",
    {
      p_items: items.map((item) => ({
        variation_id: item.variationId,
        quantity: item.quantity,
      })),
    },
  )

  if (lockError || !lockResult?.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: lockResult?.message ?? "Inventory check failed",
        code: "OUT_OF_STOCK" as const,
        item: lockResult?.item,
        available: lockResult?.available,
      },
      { status: 409 },
    )
  }
  return null
}
