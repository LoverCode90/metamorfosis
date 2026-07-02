import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { chargeCard } from "@/lib/square/payments"
import { fetchVariationMap } from "@/lib/checkout/validate-payload"
import { persistOrder } from "@/lib/checkout/persist-order"
import {
  runRequestGuards,
  checkPurchaseGuards,
  checkoutError,
} from "@/lib/checkout/checkout-guards"
import { resolveCheckoutCustomer } from "@/lib/checkout/resolve-checkout-customer"
import { lockInventory } from "@/lib/checkout/lock-inventory"
import { buildCheckoutPriceSheet } from "@/lib/checkout/build-checkout-price-sheet"
import { resolvePaymentSource } from "@/lib/checkout/resolve-payment-source"
import { finalizeOrder } from "@/lib/checkout/finalize-order"
import {
  decrementSquareInventory,
  SquareInventoryInsufficientError,
} from "@/lib/square/inventory-adjust"
import { refundOrder } from "@/lib/square/refund"
import type { CheckoutPayload, PlaceOrderResponse } from "@/lib/checkout/types"

/**
 * POST /api/checkout/validate-payment
 *
 * Anti-tamper server-side checkout: validate request → resolve buyer → price
 * (server-fetched item prices + Shippo-fetched shipping) → lock inventory →
 * charge → Square inventory decrement → persist → finalize.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<PlaceOrderResponse>> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"
  const payload = (await request.json()) as CheckoutPayload &
    Record<string, unknown>

  const requestGuard = await runRequestGuards(ip, payload)
  if (requestGuard) return requestGuard

  const {
    items,
    shippoRateId,
    address,
    termsAccepted,
    surchargeConsented,
    sourceId,
    guestEmail,
  } = payload as CheckoutPayload

  const supabase = await createClient()
  const {
    user,
    role,
    verificationStatus,
    squareCustomerId: sessionSquareCustomerId,
  } = await resolveCheckoutCustomer(supabase)

  const initialCustomerId =
    sessionSquareCustomerId ?? payload.squareCustomerId ?? null

  const admin = createAdminClient()
  const varMap = await fetchVariationMap(
    admin,
    items.map((item) => item.variationId),
  )
  if (!varMap) {
    return checkoutError("One or more items not found", "TAMPER", 400)
  }

  const purchaseGuard = checkPurchaseGuards({
    role,
    hasUser: !!user,
    items,
    varMap,
    surchargeConsented,
  })
  if (purchaseGuard) return purchaseGuard

  const inventoryError = await lockInventory(admin, items)
  if (inventoryError) return inventoryError

  const pricing = await buildCheckoutPriceSheet({
    role,
    verificationStatus,
    items,
    varMap,
    address,
    shippoRateId,
  })
  if (!pricing) {
    return checkoutError("Invalid shipping selection", "TAMPER", 400)
  }
  const { priceSheet, shipping } = pricing

  // ── Charge card (resolving a saved card-on-file first when applicable) ─────
  let paymentSourceId = sourceId
  let finalCustomerId = initialCustomerId

  if (user) {
    const resolved = await resolvePaymentSource({
      admin,
      userId: user.id,
      sourceId,
      saveCardConsented: !!payload.saveCardConsented,
      squareCustomerId: initialCustomerId,
      address,
    })
    paymentSourceId = resolved.sourceId
    finalCustomerId = resolved.customerId
  }

  const chargeResult = await chargeCard(
    paymentSourceId,
    priceSheet.totalCents,
    process.env.SQUARE_LOCATION_ID!,
    `Metamorfosis order — ${items.length} item(s)`,
    finalCustomerId,
  )
  if (!chargeResult.ok) {
    return checkoutError(chargeResult.error, "PAYMENT_FAILED", 402)
  }

  // ── Square inventory commit (authoritative cross-channel gate) ─────────────
  // Residual race: between RPC lock release and this adjustment, POS can sell
  // the last unit → charge succeeds here, Square rejects the adjustment → refund.
  // No pre-charge Square re-fetch; RPC + post-charge adjust is sufficient at scale.
  const squareLines = items.map((item) => ({
    squareVariationId: varMap.get(item.variationId)!.square_variation_id,
    quantity: item.quantity,
  }))

  try {
    await decrementSquareInventory(
      squareLines,
      `checkout-inv-${chargeResult.paymentId}`,
    )
  } catch (err) {
    if (err instanceof SquareInventoryInsufficientError) {
      await refundOrder({
        squarePaymentId: chargeResult.paymentId,
        amountCents: priceSheet.totalCents,
        reason: "Inventory no longer available",
      }).catch((refundErr) =>
        console.error(
          "[validate-payment] refund after inventory failure:",
          refundErr,
        ),
      )
      return checkoutError(
        "One or more items are no longer in stock",
        "OUT_OF_STOCK",
        409,
      )
    }
    throw err
  }

  // ── Persist order, then run post-charge side effects ───────────────────────
  const orderNumber = `MF-${Date.now().toString(36).toUpperCase()}`
  const orderId = await persistOrder(admin, {
    squareOrderId: chargeResult.squareOrderId || chargeResult.paymentId,
    squarePaymentId: chargeResult.paymentId,
    userId: user?.id ?? null,
    guestEmail: user ? null : (guestEmail ?? address.email),
    priceSheet,
    address,
    termsAccepted,
    consentTimestamp: new Date().toISOString(),
    consentIp: ip,
    carrier: shipping.carrier,
    estimatedDeliveryDate: shipping.estimatedDeliveryDate,
    shippoShipmentId: shipping.shippoShipmentId,
    shippoRateId,
  })

  if (!orderId) {
    return checkoutError(
      "Order record failed — contact support",
      "PAYMENT_FAILED",
      500,
    )
  }

  await finalizeOrder({
    admin,
    userId: user?.id ?? null,
    orderId,
    orderNumber,
    ip,
    userAgent: request.headers.get("user-agent"),
    address,
    guestEmail: guestEmail ?? null,
    priceSheet,
    shippingMethod: shipping.carrier === "pickup" ? "pickup" : "standard",
  })

  return NextResponse.json({
    ok: true,
    orderId,
    orderNumber,
    totalCents: priceSheet.totalCents,
    isPickup: shipping.carrier === "pickup",
  })
}
