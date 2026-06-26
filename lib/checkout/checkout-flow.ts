import type { CartItem } from "@/lib/types"

export interface CheckoutLineItem {
  variationId: string
  quantity: number
}

/** Cart items eligible for checkout: available and carrying a variation id. */
export function toLineItems(items: CartItem[]): CheckoutLineItem[] {
  return items
    .filter((i) => !i.unavailable && i.variationId)
    .map((i) => ({ variationId: i.variationId, quantity: i.quantity }))
}

/** Maps cart items to the cents-based shape {@link buildPriceSheet} expects. */
export function toPriceSheetItems(items: CartItem[]) {
  return items.map((i) => ({
    variationId: i.variationId ?? i.id,
    name: i.name,
    quantity: i.quantity,
    unitPriceCents: i.unitPrice,
    discountCents: i.discountPerItem ?? 0,
  }))
}
