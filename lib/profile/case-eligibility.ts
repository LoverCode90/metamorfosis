import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"
import { STORE_FAULT_REASONS } from "@/lib/constants"

/** Items below this value cannot be returned (return shipping logistics). */
export const MINIMUM_RETURN_CENTS = 1500

/** Order statuses for which a customer may open a return case. */
const VALID_ORDER_STATUSES = ["delivered"]

export interface EligibilityParams {
  orderId: string
  variationId: string
  userId: string
  reason: string
  evidenceCount: number
}

export type EligibilityResult =
  | { ok: true }
  | { ok: false; status: number; error: string }

/**
 * Server-side gate for opening a return case: verifies order ownership and
 * status, the 14-day window (when delivery is recorded), the per-item return
 * minimum, and that customer-fault reasons include at least one photo.
 */
export async function checkCaseEligibility(
  supabase: SupabaseClient,
  { orderId, variationId, userId, reason, evidenceCount }: EligibilityParams,
): Promise<EligibilityResult> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, delivered_at")
    .eq("id", orderId)
    .eq("user_id", userId)
    .single()

  if (orderError || !order) {
    return { ok: false, status: 404, error: "Order not found" }
  }

  if (!VALID_ORDER_STATUSES.includes(order.status)) {
    return {
      ok: false,
      status: 400,
      error: "Cases can only be opened for delivered orders.",
    }
  }

  if (order.delivered_at) {
    const deliveredDate = new Date(order.delivered_at)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    if (deliveredDate < fourteenDaysAgo) {
      return {
        ok: false,
        status: 400,
        error: "Cases must be opened within 14 days of delivery.",
      }
    }
  }

  const adminClient = createAdminClient()
  const { data: orderItem } = await adminClient
    .from("order_items")
    .select("unit_price_cents, quantity")
    .eq("order_id", orderId)
    .eq("variation_id", variationId)
    .single()

  const itemTotalCents =
    (orderItem?.unit_price_cents ?? 0) * (orderItem?.quantity ?? 1)

  if (itemTotalCents < MINIMUM_RETURN_CENTS) {
    return {
      ok: false,
      status: 400,
      error: `Items under $${(MINIMUM_RETURN_CENTS / 100).toFixed(2)} cannot be returned due to shipping logistics. This policy is stated in our Terms & Conditions.`,
    }
  }

  const isStoreFault = (STORE_FAULT_REASONS as readonly string[]).includes(
    reason,
  )
  if (!isStoreFault && evidenceCount === 0) {
    return {
      ok: false,
      status: 400,
      error: "At least one photo is required for this type of return.",
    }
  }

  return { ok: true }
}
