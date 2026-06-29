import "server-only"

import { NextResponse } from "next/server"
import { verifyTurnstileToken } from "@/lib/auth/turnstile"
import { paymentLimiter } from "@/lib/rate-limit"
import {
  hasTamperedPriceFields,
  hasProfessionalItem,
  type CheckoutVariationMap,
} from "@/lib/checkout/validate-payload"
import type { CheckoutPayload, PlaceOrderResponse } from "@/lib/checkout/types"
import type { UserRole } from "@/lib/types"

type ErrorCode = NonNullable<Extract<PlaceOrderResponse, { ok: false }>["code"]>

/** Builds a typed `PlaceOrderError` JSON response. */
export function checkoutError(error: string, code: ErrorCode, status: number) {
  return NextResponse.json<PlaceOrderResponse>(
    { ok: false, error, code },
    { status },
  )
}

/** Request-level guards: rate limit, tamper, bot check, empty cart. */
export async function runRequestGuards(
  ip: string,
  payload: CheckoutPayload & Record<string, unknown>,
): Promise<NextResponse<PlaceOrderResponse> | null> {
  const { success } = await paymentLimiter.limit(`payment:${ip}`)
  if (!success) {
    return checkoutError(
      "Too many attempts. Please wait a moment and try again.",
      "RATE_LIMITED",
      429,
    )
  }
  if (hasTamperedPriceFields(payload)) {
    return checkoutError("Tampered payload", "TAMPER", 400)
  }
  if (!(await verifyTurnstileToken(payload.turnstileToken))) {
    return checkoutError("Bot check failed", "TURNSTILE", 403)
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return checkoutError("Empty cart", "TAMPER", 400)
  }
  return null
}

interface PurchaseGuardArgs {
  role: UserRole
  hasUser: boolean
  items: CheckoutPayload["items"]
  varMap: CheckoutVariationMap
  surchargeConsented: boolean
}

/** Item-level guards: professional-product sign-in + surcharge consent. */
export function checkPurchaseGuards({
  role,
  hasUser,
  items,
  varMap,
  surchargeConsented,
}: PurchaseGuardArgs): NextResponse<PlaceOrderResponse> | null {
  if (role !== "admin" && !hasUser && hasProfessionalItem(items, varMap)) {
    return checkoutError(
      "Sign in required for professional products",
      "UNAUTHORIZED",
      401,
    )
  }
  if (!surchargeConsented) {
    return checkoutError(
      "Card processing fee must be accepted",
      "CONSENT_REQUIRED",
      400,
    )
  }
  return null
}
