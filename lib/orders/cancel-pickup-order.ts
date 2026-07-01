import "server-only"

import type { createAdminClient } from "@/lib/supabase/admin"
import { refundOrder } from "@/lib/square/refund"
import { sendOrderCanceled } from "@/lib/email/order-status-emails"

type AdminClient = ReturnType<typeof createAdminClient>

export const CANCELABLE_PICKUP_STATUSES = [
  "pending",
  "confirmed",
  "processing",
] as const

interface CancelPickupOrderOptions {
  adminId?: string
  reason: string
  auditAction: "pickup_deadline_expired" | "admin_cancel_pickup"
  emailReason: string
}

interface PickupOrderRow {
  id: string
  square_order_id: string
  status: string
  total_cents: number
  shipping_address: unknown
  order_items: { variation_id: string; quantity: number }[] | null
}

/** Refund, cancel, restore inventory, and email for one pickup order. */
export async function cancelPickupOrder(
  admin: AdminClient,
  order: PickupOrderRow,
  options: CancelPickupOrderOptions,
): Promise<void> {
  if (
    !CANCELABLE_PICKUP_STATUSES.includes(
      order.status as (typeof CANCELABLE_PICKUP_STATUSES)[number],
    )
  ) {
    throw new Error("Order is not eligible for pickup cancellation")
  }

  const isLegacyTestOrder = order.square_order_id?.startsWith("test-")
  if (order.square_order_id && !isLegacyTestOrder) {
    await refundOrder(order.square_order_id, order.total_cents, options.reason)
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({ status: "canceled" })
    .eq("id", order.id)
    .in("status", [...CANCELABLE_PICKUP_STATUSES])

  if (updateError) {
    throw new Error(`Failed to update order status: ${updateError.message}`)
  }

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
    admin_id: options.adminId ?? null,
    action: options.auditAction,
    target_table: "orders",
    target_id: order.id,
    new_value: { status: "canceled" },
    notes: options.reason,
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
      reason: options.emailReason,
      canceledByStore: true,
    }).catch((err) => console.error("[cancel-pickup-order] email failed:", err))
  }
}
