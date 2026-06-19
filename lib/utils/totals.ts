import type { CartItem, Totals } from "@/lib/types"

export const TAX_RATE = 0.08

/** Per-region flat shipping rates in USD. */
export const SHIPPING_TABLE: Record<string, number> = {
  "United States": 6,
  Canada: 12,
  "United Kingdom": 14,
  Australia: 18,
  Germany: 14,
}

export function shippingFor(country: string): number {
  return SHIPPING_TABLE[country] ?? 15
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function computeTotals(items: CartItem[]): Totals {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const discount = items.reduce(
    (sum, i) => sum + i.discountPerItem * i.quantity,
    0,
  )
  const shipping = 0
  const tax = round2((subtotal - discount) * TAX_RATE)
  const total = round2(subtotal - discount + shipping + tax)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  return { subtotal, discount, shipping, tax, total, itemCount }
}

export function computeTotalsWithShipping(
  items: CartItem[],
  shipping: number,
): Totals {
  const base = computeTotals(items)
  const total = round2(base.subtotal - base.discount + shipping + base.tax)
  return { ...base, shipping, total }
}
