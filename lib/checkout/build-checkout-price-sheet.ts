import "server-only"

import {
  isDiscountEligible,
  applyProfessionalDiscount,
} from "@/lib/checkout/discount"
import {
  buildDiscountableItems,
  type CheckoutVariationMap,
} from "@/lib/checkout/validate-payload"
import { buildPriceSheet } from "@/lib/checkout/totals"
import {
  resolveShipping,
  type ResolvedShipping,
} from "@/lib/checkout/resolve-shipping"
import { getTaxRate } from "@/lib/tax"
import type {
  CheckoutAddress,
  CheckoutPayload,
  PriceSheet,
} from "@/lib/checkout/types"
import type { DbVerificationStatus, UserRole } from "@/lib/types"

interface BuildPriceSheetArgs {
  role: UserRole
  verificationStatus: DbVerificationStatus
  items: CheckoutPayload["items"]
  varMap: CheckoutVariationMap
  address: CheckoutAddress
  shippoRateId: string | null
}

export interface CheckoutPricing {
  priceSheet: PriceSheet
  shipping: ResolvedShipping
}

/**
 * Computes professional discount, tax, server-side shipping (anti-tamper), and
 * the final price sheet. Returns null when the shipping selection is invalid.
 */
export async function buildCheckoutPriceSheet({
  role,
  verificationStatus,
  items,
  varMap,
  address,
  shippoRateId,
}: BuildPriceSheetArgs): Promise<CheckoutPricing | null> {
  const eligible = isDiscountEligible(role, verificationStatus)
  const withDiscount = applyProfessionalDiscount(
    buildDiscountableItems(items, varMap),
    eligible,
  )
  const taxExempt =
    role === "admin" ||
    (role === "salon_owner" && verificationStatus === "approved")
  const taxRate = taxExempt ? 0 : await getTaxRate(address.zip, address.state)

  const grossSubtotalCents = withDiscount.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  )
  const shipping = await resolveShipping(shippoRateId, grossSubtotalCents)
  if (!shipping) return null

  const priceSheet = buildPriceSheet(
    withDiscount,
    shipping.shippingChargedCents,
    taxExempt,
    taxRate,
  )
  return { priceSheet, shipping }
}
