import "server-only"

import { NextResponse } from "next/server"
import type { createAdminClient } from "@/lib/supabase/admin"
import type { CheckoutPayload, PlaceOrderResponse } from "@/lib/checkout/types"

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Locks inventory rows (SELECT ... FOR UPDATE via RPC). Returns an error
 * response when stock is insufficient, or null when the lock succeeds.
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
