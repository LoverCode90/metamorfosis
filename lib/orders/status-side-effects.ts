import "server-only"

import type { createAdminClient } from "@/lib/supabase/admin"
import type { CheckoutAddress } from "@/lib/checkout/types"
import {
  sendOrderDelivered,
  sendOrderShipped,
} from "@/lib/email/order-status-emails"

type AdminClient = ReturnType<typeof createAdminClient>

const SIDE_EFFECT_SELECT = `
  id, square_order_id, guest_email, shipping_address, carrier,
  tracking_number, tracking_url,
  profiles ( full_name, email )
`

function shortNumber(order: { square_order_id: string; id: string }): string {
  return order.square_order_id?.startsWith("MF-")
    ? order.square_order_id
    : `#${order.id.slice(0, 8).toUpperCase()}`
}

/**
 * Fire-and-forget customer emails for an admin-driven status change. Sends the
 * shipped / delivered email for the matching status. Never throws — failures
 * are logged so the status update still succeeds.
 *
 * Note: "confirmed" sends no email — the order-confirmation email is already
 * dispatched at checkout, and there is no sent-flag column to safely re-send.
 */
export async function runOrderStatusSideEffects(
  admin: AdminClient,
  orderId: string,
  newStatus: string,
): Promise<void> {
  if (newStatus !== "shipped" && newStatus !== "delivered") return

  const { data: order } = await admin
    .from("orders")
    .select(SIDE_EFFECT_SELECT)
    .eq("id", orderId)
    .single()
  if (!order) return

  const profile = order.profiles as {
    full_name?: string
    email?: string
  } | null
  const address = order.shipping_address as CheckoutAddress | null
  const email = profile?.email ?? address?.email ?? order.guest_email
  if (!email) return

  const customerName = profile?.full_name ?? address?.fullName ?? "there"
  const orderNumber = shortNumber(order)

  try {
    if (newStatus === "shipped") {
      await sendOrderShipped({
        to: email,
        customerName,
        orderNumber,
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url,
        carrier: order.carrier,
      })
    } else {
      await sendOrderDelivered({ to: email, customerName, orderNumber })
    }
  } catch (err) {
    console.error("[status-side-effects]", newStatus, err)
  }
}
