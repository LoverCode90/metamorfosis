import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { chargeCard } from "@/lib/square/payments"
import { verifyTurnstileToken } from "@/lib/auth/turnstile"
import {
  isDiscountEligible,
  applyProfessionalDiscount,
} from "@/lib/checkout/discount"
import { buildPriceSheet } from "@/lib/checkout/totals"
import { clearDbCart } from "@/lib/cart/db"
import { saveCheckoutAddress } from "@/lib/addresses/db"
import { sendOrderConfirmation } from "@/lib/email/resend"
import { paymentLimiter } from "@/lib/rate-limit"
import type { CheckoutPayload, PlaceOrderResponse } from "@/lib/checkout/types"
import type { DbVerificationStatus, UserRole } from "@/lib/types"

/**
 * POST /api/checkout/validate-payment
 *
 * Anti-tamper server-side checkout:
 * 1. Validate Turnstile token
 * 2. Fetch variation prices from Square (source of truth)
 * 3. Apply professional discounts server-side
 * 4. Inventory lock (SELECT ... FOR UPDATE via RPC)
 * 5. Charge card via Square Payments
 * 6. Create orders + order_items in Supabase
 * 7. Clear cart
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<PlaceOrderResponse>> {
  // ── Rate limit (also guards the order-confirmation email + card-testing) ──
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"
  const { success: withinLimit } = await paymentLimiter.limit(`payment:${ip}`)
  if (!withinLimit) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many attempts. Please wait a moment and try again.",
        code: "RATE_LIMITED",
      },
      { status: 429 },
    )
  }

  const payload = (await request.json()) as CheckoutPayload &
    Record<string, unknown>

  // ── Reject any client-sent price fields ────────────────────────────────────
  const forbidden = [
    "price",
    "total",
    "subtotal",
    "amount",
    "discount",
    "tax",
    "shipping",
    "surcharge_consented_at",
    "surcharge_consented_ip",
    "chemical_warning_consented_at",
    "chemical_warning_consented_ip",
  ]
  for (const key of forbidden) {
    if (key in payload) {
      return NextResponse.json(
        { ok: false, error: "Tampered payload", code: "TAMPER" },
        { status: 400 },
      )
    }
  }

  const {
    items,
    shippingMethod,
    address,
    termsAccepted,
    surchargeConsented,
    turnstileToken,
    sourceId,
    guestEmail,
  } = payload as CheckoutPayload

  // ── Validate Turnstile ─────────────────────────────────────────────────────
  const turnstileOk = await verifyTurnstileToken(turnstileToken)
  if (!turnstileOk) {
    return NextResponse.json(
      { ok: false, error: "Bot check failed", code: "TURNSTILE" },
      { status: 403 },
    )
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Empty cart", code: "TAMPER" },
      { status: 400 },
    )
  }

  // ── Auth check ─────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role: UserRole = "standard_customer"
  let verificationStatus: DbVerificationStatus = "not_applicable"

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, verification_status")
      .eq("id", user.id)
      .single()
    if (profile) {
      role = profile.role as UserRole
      verificationStatus = profile.verification_status as DbVerificationStatus
    }
  }

  const admin = createAdminClient()

  // ── Fetch variation data from Supabase (mirrors Square prices post-sync) ───
  const variationIds = items.map((i) => i.variationId)
  const { data: variationRows } = await admin
    .from("product_variations")
    .select(
      "id, square_variation_id, name_en, price_cents, inventory_count, is_active, product_translations(is_professional, is_color_product, is_returnable, is_active)",
    )
    .in("id", variationIds)

  if (!variationRows || variationRows.length !== variationIds.length) {
    return NextResponse.json(
      { ok: false, error: "One or more items not found", code: "TAMPER" },
      { status: 400 },
    )
  }

  const varMap = new Map(
    (
      variationRows as unknown as {
        id: string
        square_variation_id: string
        name_en: string
        price_cents: number
        inventory_count: number
        is_active: boolean
        product_translations: {
          is_professional: boolean
          is_color_product: boolean
          is_returnable: boolean
          is_active: boolean
        } | null
      }[]
    ).map((v) => [v.id, v]),
  )

  // ── Professional items gate ────────────────────────────────────────────────
  // Admins bypass all purchase restrictions.
  if (role !== "admin") {
    for (const item of items) {
      const v = varMap.get(item.variationId)
      if (!v) continue
      if (v.product_translations?.is_professional && !user) {
        return NextResponse.json(
          {
            ok: false,
            error: "Sign in required for professional products",
            code: "UNAUTHORIZED",
          },
          { status: 401 },
        )
      }
    }
  }

  // ── Consent checks (server-side — client checkboxes can be bypassed) ───────
  // Surcharge fee acknowledgment is always required.
  if (!surchargeConsented) {
    return NextResponse.json(
      {
        ok: false,
        error: "Card processing fee must be accepted",
        code: "CONSENT_REQUIRED",
      },
      { status: 400 },
    )
  }

  // Non-returnable (chemical) products require the warning acknowledgment.
  const hasChemicalItems = items.some((item) => {
    const v = varMap.get(item.variationId)
    return v?.product_translations?.is_returnable === false
  })
  if (hasChemicalItems && !termsAccepted) {
    return NextResponse.json(
      {
        ok: false,
        error: "Non-returnable products warning must be accepted",
        code: "CONSENT_REQUIRED",
      },
      { status: 400 },
    )
  }

  // ── Inventory lock (row-level FOR UPDATE via RPC) ──────────────────────────
  const { data: lockResult, error: lockError } = await admin.rpc(
    "check_and_lock_inventory",
    {
      p_items: items.map((i) => ({
        variation_id: i.variationId,
        quantity: i.quantity,
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

  // ── Build price sheet ──────────────────────────────────────────────────────
  const eligible = isDiscountEligible(role, verificationStatus)

  const discountableItems = items.map((i) => {
    const v = varMap.get(i.variationId)!
    return {
      variationId: i.variationId,
      name: v.name_en,
      quantity: i.quantity,
      unitPriceCents: v.price_cents,
      isColorProduct: v.product_translations?.is_color_product ?? false,
    }
  })

  const withDiscount = applyProfessionalDiscount(discountableItems, eligible)
  const taxExempt =
    role === "admin" ||
    (role === "salon_owner" && verificationStatus === "approved")
  const priceSheet = buildPriceSheet(withDiscount, shippingMethod, taxExempt)

  // ── Charge card ────────────────────────────────────────────────────────────
  const locationId = process.env.SQUARE_LOCATION_ID!
  const chargeResult = await chargeCard(
    sourceId,
    priceSheet.totalCents,
    locationId,
    `Metamorfosis order — ${items.length} item(s)`,
  )

  if (!chargeResult.ok) {
    return NextResponse.json(
      { ok: false, error: chargeResult.error, code: "PAYMENT_FAILED" },
      { status: 402 },
    )
  }

  // ── Create order in Supabase ───────────────────────────────────────────────
  // REQUIRES MIGRATION: docs/migrations/20260623_surcharge_and_consents.sql
  // must be run in Supabase before deploying — the surcharge_cents and
  // *_consented_at/ip columns below do not exist until then, and this insert
  // runs AFTER the card is charged, so a missing column would charge the
  // customer without creating an order record.
  const orderNumber = `MF-${Date.now().toString(36).toUpperCase()}`
  const consentTimestamp = new Date().toISOString()

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      square_order_id: chargeResult.squareOrderId || chargeResult.paymentId,
      user_id: user?.id ?? null,
      guest_email: user ? null : (guestEmail ?? address.email),
      status: "confirmed",
      shipping_method: shippingMethod,
      subtotal_cents: priceSheet.subtotalCents,
      discount_cents: priceSheet.discountCents,
      shipping_cents: priceSheet.shippingCents,
      tax_cents: priceSheet.taxCents,
      surcharge_cents: priceSheet.surchargeCents,
      total_cents: priceSheet.totalCents,
      shipping_address: address,
      terms_accepted: termsAccepted,
      surcharge_consented_at: consentTimestamp,
      surcharge_consented_ip: ip,
      ...(hasChemicalItems && termsAccepted
        ? {
            chemical_warning_consented_at: consentTimestamp,
            chemical_warning_consented_ip: ip,
          }
        : {}),
    })
    .select("id")
    .single()

  if (orderError || !order) {
    console.error("[validate-payment] Order insert failed:", orderError)
    return NextResponse.json(
      {
        ok: false,
        error: "Order record failed — contact support",
        code: "PAYMENT_FAILED",
      },
      { status: 500 },
    )
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

  // ── Clear cart ─────────────────────────────────────────────────────────────
  if (user) {
    await clearDbCart(user.id)
  }

  // ── Save shipping address for logged-in users ──────────────────────────────
  if (user) {
    saveCheckoutAddress(user.id, address).catch((err) =>
      console.error("[validate-payment] Address save failed:", err),
    )
  }

  // ── Send order confirmation email (fire-and-forget) ────────────────────────
  const recipientEmail = user ? address.email : (guestEmail ?? address.email)
  sendOrderConfirmation({
    to: recipientEmail,
    orderNumber,
    address,
    items: priceSheet.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      discountCents: i.discountCents,
    })),
    priceSheet,
    shippingMethod,
  }).catch((err) => console.error("[validate-payment] Email send failed:", err))

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    orderNumber,
    totalCents: priceSheet.totalCents,
  })
}
