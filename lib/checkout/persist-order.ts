import "server-only"
import type { createAdminClient } from "@/lib/supabase/admin"
import type { CheckoutAddress, CheckoutPayload, PriceSheet } from "./types"
import type { CheckoutVariationMap } from "./validate-payload"
import { PICKUP_WINDOW_MS } from "@/lib/orders/order-status-config"

type AdminClient = ReturnType<typeof createAdminClient>

export interface PersistOrderParams {
  squareOrderId: string
  userId: string | null
  guestEmail: string | null
  priceSheet: PriceSheet
  address: CheckoutAddress
  termsAccepted: boolean
  consentTimestamp: string
  consentIp: string
  /** Shippo carrier + delivery estimate ("pickup"/null for in-store pickup). */
  carrier: string
  estimatedDeliveryDate: string | null
  shippoShipmentId: string | null
  /** Saved so the admin can buy the shipping label later (null for pickup). */
  shippoRateId: string | null
  items: CheckoutPayload["items"]
  varMap: CheckoutVariationMap
}

/**
 * Post-charge persistence: insert the order + order_items and decrement
 * inventory. Returns the new order id, or null if the order insert failed
 * (the caller turns that into a 500 — the card was already charged).
 *
 * REQUIRES MIGRATION: docs/migrations/20260623_surcharge_and_consents.sql
 * must be run in Supabase before deploying — the surcharge_cents and
 * *_consented_at/ip columns below do not exist until then, and this insert
 * runs AFTER the card is charged, so a missing column would charge the
 * customer without creating an order record.
 */
export async function persistOrder(
  admin: AdminClient,
  params: PersistOrderParams,
): Promise<string | null> {
  const {
    squareOrderId,
    userId,
    guestEmail,
    priceSheet,
    address,
    termsAccepted,
    consentTimestamp,
    consentIp,
    carrier,
    estimatedDeliveryDate,
    shippoShipmentId,
    shippoRateId,
    items,
    varMap,
  } = params

  const isPickup = carrier.toLowerCase() === "pickup"
  const pickupDeadlineAt = isPickup
    ? new Date(Date.now() + PICKUP_WINDOW_MS).toISOString()
    : null

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      square_order_id: squareOrderId,
      user_id: userId,
      guest_email: guestEmail,
      // New orders start as "pending" until payment/fulfillment is confirmed.
      status: "pending",
      shipping_method: isPickup ? "pickup" : "standard",
      subtotal_cents: priceSheet.subtotalCents,
      discount_cents: priceSheet.discountCents,
      shipping_cents: priceSheet.shippingCents,
      tax_cents: priceSheet.taxCents,
      surcharge_cents: priceSheet.surchargeCents,
      total_cents: priceSheet.totalCents,
      shipping_address: address,
      carrier,
      estimated_delivery_date: estimatedDeliveryDate,
      shippo_shipment_id: shippoShipmentId,
      shippo_rate_id: shippoRateId,
      pickup_deadline_at: pickupDeadlineAt,
      terms_accepted: termsAccepted,
      surcharge_consented_at: consentTimestamp,
      surcharge_consented_ip: consentIp,
    })
    .select("id")
    .single()

  if (orderError || !order) {
    console.error("[validate-payment] Order insert failed:", orderError)
    return null
  }

  // ── Create order_items ─────────────────────────────────────────────────────
  await admin.from("order_items").insert(
    priceSheet.items.map((item) => ({
      order_id: order.id,
      variation_id: item.variationId,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      discount_cents: item.discountCents,
    })),
  )

  // ── Decrement inventory ────────────────────────────────────────────────────
  for (const item of items) {
    const v = varMap.get(item.variationId)!
    await admin
      .from("product_variations")
      .update({
        inventory_count: Math.max(0, v.inventory_count - item.quantity),
      })
      .eq("id", item.variationId)
  }

  return order.id
}
