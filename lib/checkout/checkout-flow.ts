import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import { buildPriceSheet } from "@/lib/checkout/totals"
import type { LiveShippingRate, PriceSheet } from "@/lib/checkout/types"
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

/**
 * Client-side display price sheet. Shipping is the selected rate, or 0 when the
 * free-shipping threshold is met or no rate is picked yet. The server
 * recomputes the authoritative total at charge time.
 */
export function computeClientPriceSheet(
  items: CartItem[],
  selectedRate: LiveShippingRate | null,
  taxRate: number,
): PriceSheet {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )
  const qualifiesForFreeShipping =
    subtotalCents >= FREE_SHIPPING_THRESHOLD * 100
  const shippingChargedCents =
    !selectedRate || qualifiesForFreeShipping ? 0 : selectedRate.amount_cents
  return buildPriceSheet(
    toPriceSheetItems(items),
    shippingChargedCents,
    false,
    taxRate,
  )
}
