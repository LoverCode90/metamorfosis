import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  chargeCard,
  getOrCreateCustomer,
  createCardOnFile,
  retrieveCardMetadata,
} from "@/lib/square/payments"
import { verifyTurnstileToken } from "@/lib/auth/turnstile"
import {
  isDiscountEligible,
  applyProfessionalDiscount,
} from "@/lib/checkout/discount"
import { buildPriceSheet } from "@/lib/checkout/totals"
import { getTaxRate } from "@/lib/tax"
import {
  hasTamperedPriceFields,
  fetchVariationMap,
  hasProfessionalItem,
  hasChemicalItems,
  buildDiscountableItems,
} from "@/lib/checkout/validate-payload"
import { persistOrder } from "@/lib/checkout/persist-order"
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
  if (hasTamperedPriceFields(payload)) {
    return NextResponse.json(
      { ok: false, error: "Tampered payload", code: "TAMPER" },
      { status: 400 },
    )
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
  let squareCustomerId: string | null = null
  let squareCardId: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, verification_status, square_customer_id, square_card_id")
      .eq("id", user.id)
      .single()
    if (profile) {
      role = profile.role as UserRole
      verificationStatus = profile.verification_status as DbVerificationStatus
      squareCustomerId = profile.square_customer_id as string | null
      squareCardId = profile.square_card_id as string | null
    }
  }

  const admin = createAdminClient()

  // ── Fetch variation data from Supabase (mirrors Square prices post-sync) ───
  const variationIds = items.map((i) => i.variationId)
  const varMap = await fetchVariationMap(admin, variationIds)

  if (!varMap) {
    return NextResponse.json(
      { ok: false, error: "One or more items not found", code: "TAMPER" },
      { status: 400 },
    )
  }

  // ── Professional items gate (admins bypass all purchase restrictions) ──────
  if (role !== "admin" && !user && hasProfessionalItem(items, varMap)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Sign in required for professional products",
        code: "UNAUTHORIZED",
      },
      { status: 401 },
    )
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
  const chemicalItems = hasChemicalItems(items, varMap)
  if (chemicalItems && !termsAccepted) {
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
  const discountableItems = buildDiscountableItems(items, varMap)
  const withDiscount = applyProfessionalDiscount(discountableItems, eligible)
  const taxExempt =
    role === "admin" ||
    (role === "salon_owner" && verificationStatus === "approved")
  const taxRate = taxExempt ? 0 : await getTaxRate(address.zip, address.state)
  const priceSheet = buildPriceSheet(
    withDiscount,
    shippingMethod,
    taxExempt,
    taxRate,
  )

  // ── Card on File (COF) flow ───────────────────────────────────────────────
  let paymentSourceId = sourceId

  if (user) {
    // If sourceId is already ccof:, use it directly
    if (sourceId.startsWith("ccof:")) {
      paymentSourceId = sourceId
    } else if (payload.saveCardConsented) {
      // Search or create Square Customer using Supabase user.id as referenceId
      const customerId =
        squareCustomerId ??
        (await getOrCreateCustomer(user.id, address.email, address.fullName))
      if (customerId) {
        // Invoke client.cards.createCard using frontend card nonce and customerId
        const cardId = await createCardOnFile(sourceId, customerId)
        if (cardId) {
          paymentSourceId = cardId

          // Keep profiles.square_card_id updated to the most recently used card
          await admin
            .from("profiles")
            .update({
              square_customer_id: customerId,
              square_card_id: cardId,
            })
            .eq("id", user.id)

          // Persist card metadata in saved_cards (max 3 per user — silently skip if at limit)
          const { count } = await admin
            .from("saved_cards")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)

          if ((count ?? 0) < 3) {
            const meta = await retrieveCardMetadata(cardId)
            if (meta) {
              await admin.from("saved_cards").insert({
                user_id: user.id,
                square_card_id: cardId,
                square_customer_id: customerId,
                brand: meta.brand,
                last_four: meta.last4,
                exp_month: meta.expMonth,
                exp_year: meta.expYear,
              })
            }
          }
        }
      }
    }
  }

  // ── Charge card ────────────────────────────────────────────────────────────
  const locationId = process.env.SQUARE_LOCATION_ID!
  const chargeResult = await chargeCard(
    paymentSourceId,
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

  // ── Create order in Supabase (+ items, inventory decrement) ────────────────
  const orderNumber = `MF-${Date.now().toString(36).toUpperCase()}`
  const consentTimestamp = new Date().toISOString()

  const orderId = await persistOrder(admin, {
    squareOrderId: chargeResult.squareOrderId || chargeResult.paymentId,
    userId: user?.id ?? null,
    guestEmail: user ? null : (guestEmail ?? address.email),
    shippingMethod,
    priceSheet,
    address,
    termsAccepted,
    hasChemicalItems: chemicalItems,
    consentTimestamp,
    consentIp: ip,
    items,
    varMap,
  })

  if (!orderId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Order record failed — contact support",
        code: "PAYMENT_FAILED",
      },
      { status: 500 },
    )
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
    orderId,
    orderNumber,
    totalCents: priceSheet.totalCents,
  })
}
