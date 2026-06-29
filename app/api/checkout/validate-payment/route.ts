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
import type { CheckoutPayload, PlaceOrderResponse } from "@/lib/checkout/types"

/**
 * POST /api/checkout/validate-payment
 *
 * Anti-tamper server-side checkout: validate request → resolve buyer → price
 * (server-fetched item prices + Shippo-fetched shipping) → lock inventory →
 * charge → persist → finalize. Each stage lives in lib/checkout/*.
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

  // ── Persist order, then run post-charge side effects ───────────────────────
  const orderNumber = `MF-${Date.now().toString(36).toUpperCase()}`
  const orderId = await persistOrder(admin, {
    squareOrderId: chargeResult.squareOrderId || chargeResult.paymentId,
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
    items,
    varMap,
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
  })
}
