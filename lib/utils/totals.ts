import type { CartItem, Totals } from "@/lib/types"
import { CARD_SURCHARGE_RATE } from "@/lib/constants"

export const TAX_RATE = 0.0975 // CA sales tax — rounded estimate; server uses Square's exact calc

/** Per-region flat shipping rates in cents (legacy; Phase 6 replaces with Shippo). */
export const SHIPPING_TABLE: Record<string, number> = {
  "United States": 700,
  Canada: 1200,
  "United Kingdom": 1400,
  Australia: 1800,
  Germany: 1400,
}

export function shippingFor(country: string): number {
  return SHIPPING_TABLE[country] ?? 1500
}

/** Free Standard Shipping threshold in cents. */
export const FREE_SHIPPING_THRESHOLD_CENTS = parseInt(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS ?? "12000",
  10,
)

/** Professional discount per color product, in cents. */
export const PRO_DISCOUNT_PER_ITEM = 200

const round2 = (n: number) => Math.round(n * 100) / 100

export function computeTotals(items: CartItem[]): Totals {
  const available = items.filter((i) => !i.unavailable)
  const subtotal = available.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  )
  const discount = available.reduce(
    (sum, i) => sum + i.discountPerItem * i.quantity,
    0,
  )
  const shipping = 0 // determined at checkout shipping step
  const tax = round2((subtotal - discount) * TAX_RATE)
  const surcharge = round2((subtotal - discount) * CARD_SURCHARGE_RATE)
  const total = round2(subtotal - discount + shipping + tax + surcharge)
  const itemCount = available.reduce((sum, i) => sum + i.quantity, 0)
  return { subtotal, discount, shipping, tax, surcharge, total, itemCount }
}

export function computeTotalsWithShipping(
  items: CartItem[],
  shippingCents: number,
): Totals {
  const base = computeTotals(items)
  const shipping = shippingCents
  const total = round2(
    base.subtotal - base.discount + shipping + base.tax + base.surcharge,
  )
  return { ...base, shipping, total }
}

/**
 * Apply the $2 professional discount to color products in the cart.
 * Server recalculates independently — this is display-only.
 */
export function applyProDiscountClient(
  items: CartItem[],
  isVerifiedPro: boolean,
): CartItem[] {
  if (!isVerifiedPro) return items
  return items.map((i) =>
    i.isColorProduct ? { ...i, discountPerItem: PRO_DISCOUNT_PER_ITEM } : i,
  )
}
