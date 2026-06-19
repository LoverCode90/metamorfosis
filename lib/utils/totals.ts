import type { CartItem, Totals } from "@/lib/types"

export const TAX_RATE = 0.0975 // CA sales tax — rounded estimate; server uses Square's exact calc

/** Per-region flat shipping rates in USD (legacy; Phase 6 replaces with Shippo). */
export const SHIPPING_TABLE: Record<string, number> = {
  "United States": 7,
  Canada: 12,
  "United Kingdom": 14,
  Australia: 18,
  Germany: 14,
}

export function shippingFor(country: string): number {
  return SHIPPING_TABLE[country] ?? 15
}

/** Free Standard Shipping threshold in cents. */
export const FREE_SHIPPING_THRESHOLD_CENTS = parseInt(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS ?? "7000",
  10,
)

/** Professional discount per color product, in dollars. */
export const PRO_DISCOUNT_PER_ITEM = 2

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
  const total = round2(subtotal - discount + shipping + tax)
  const itemCount = available.reduce((sum, i) => sum + i.quantity, 0)
  return { subtotal, discount, shipping, tax, total, itemCount }
}

export function computeTotalsWithShipping(
  items: CartItem[],
  shippingCents: number,
): Totals {
  const base = computeTotals(items)
  const shipping = shippingCents / 100
  const total = round2(base.subtotal - base.discount + shipping + base.tax)
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
