import "server-only"

import type { DbVerificationStatus, UserRole } from "@/lib/types"

/** $2.00 per color product for verified professionals/students. */
export const PRO_DISCOUNT_CENTS = 200

export function isDiscountEligible(
  role: UserRole,
  verificationStatus: DbVerificationStatus,
): boolean {
  return (
    (role === "professional" || role === "student") &&
    verificationStatus === "approved"
  )
}

export interface DiscountableItem {
  variationId: string
  name: string
  quantity: number
  unitPriceCents: number
  isColorProduct: boolean
}

export function applyProfessionalDiscount(
  items: DiscountableItem[],
  eligible: boolean,
): (DiscountableItem & { discountCents: number })[] {
  return items.map((item) => ({
    ...item,
    discountCents: eligible && item.isColorProduct ? PRO_DISCOUNT_CENTS : 0,
  }))
}
