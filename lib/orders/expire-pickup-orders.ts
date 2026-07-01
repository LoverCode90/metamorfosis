import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { refundOrder } from "@/lib/square/refund"
import { sendOrderCanceled } from "@/lib/email/order-status-emails"

const EXPIRABLE_STATUSES = ["pending", "confirmed", "processing"] as const

export interface ExpirePickupOrdersResult {
  processed: number
  failed: number
}

/** Cancel and refund pickup orders past their deadline; restore inventory. */
export async function expirePickupOrders(): Promise<ExpirePickupOrdersResult> {
  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { data: orders, error } = await admin
    .from("orders")
    .select(
      `id, square_order_id, status, total_cents, carrier, shipping_address,
      order_items ( variation_id, quantity )`,
    )
    .eq("carrier", "pickup")
    .in("status", [...EXPIRABLE_STATUSES])
    .lt("pickup_deadline_at", now)

  if (error) {
    throw new Error(`Failed to query expired pickup orders: ${error.message}`)
  }

  let processed = 0
  let failed = 0

  for (const order of orders ?? []) {
    try {
      const isLegacyTestOrder = order.square_order_id?.startsWith("test-")
      if (order.square_order_id && !isLegacyTestOrder) {
        await refundOrder(
          order.square_order_id,
          order.total_cents,
          "Pickup deadline expired — automatic refund",
        )
      }

      await admin
        .from("orders")
        .update({ status: "canceled" })
        .eq("id", order.id)
        .in("status", [...EXPIRABLE_STATUSES])

      for (const item of order.order_items ?? []) {
        const { data: variation } = await admin
          .from("product_variations")
          .select("inventory_count")
          .eq("id", item.variation_id)
          .single()

        if (variation) {
          await admin
            .from("product_variations")
            .update({
              inventory_count: variation.inventory_count + item.quantity,
            })
            .eq("id", item.variation_id)
        }
      }

      await admin.from("audit_logs").insert({
        action: "pickup_deadline_expired",
        target_table: "orders",
        target_id: order.id,
        new_value: { status: "canceled" },
        notes: "Automatic cancel + refund after 5-day pickup window",
      })

      const addr = order.shipping_address as {
        email?: string
        fullName?: string
      } | null
      const customerEmail = addr?.email
      if (customerEmail) {
        await sendOrderCanceled({
          to: customerEmail,
          customerName: addr?.fullName ?? "there",
          orderNumber: order.square_order_id,
          reason:
            "Your pickup order was not collected within 5 days and has been automatically canceled and refunded.",
          canceledByStore: true,
        }).catch((err) =>
          console.error("[expire-pickup-orders] email failed:", err),
        )
      }

      processed += 1
    } catch (err) {
      failed += 1
      console.error("[expire-pickup-orders] order failed:", order.id, err)
    }
  }

  return { processed, failed }
}
