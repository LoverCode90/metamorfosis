// Shared calculation logic for both server and client components

import { CARD_SURCHARGE_RATE, TAX_RATE } from "@/lib/constants"
import type { PriceSheet } from "./types"

/**
 * Builds the order price breakdown. `shippingCents` is supplied by the caller
 * (a live Shippo rate, or 0 when free shipping applies) — this module no
 * longer derives shipping from fixed tiers.
 */
export function buildPriceSheet(
  itemsWithDiscount: {
    variationId: string
    name: string
    quantity: number
    unitPriceCents: number
    discountCents: number
  }[],
  shippingCents: number,
  taxExempt = false,
  taxRate = TAX_RATE,
): PriceSheet {
  const items = itemsWithDiscount.map((i) => ({
    ...i,
    isColorProduct: undefined, // strip internal field
    lineTotalCents: (i.unitPriceCents - i.discountCents) * i.quantity,
  }))

  const subtotalCents = itemsWithDiscount.reduce(
    (s, i) => s + i.unitPriceCents * i.quantity,
    0,
  )
  const discountCents = itemsWithDiscount.reduce(
    (s, i) => s + i.discountCents * i.quantity,
    0,
  )
  const taxCents = taxExempt
    ? 0
    : Math.round((subtotalCents - discountCents) * taxRate)
  const surchargeCents = Math.round(
    (subtotalCents - discountCents) * CARD_SURCHARGE_RATE,
  )
  const totalCents =
    subtotalCents - discountCents + shippingCents + taxCents + surchargeCents

  return {
    items: items.map(
      ({
        variationId,
        name,
        quantity,
        unitPriceCents,
        discountCents: dc,
        lineTotalCents,
      }) => ({
        variationId,
        name,
        quantity,
        unitPriceCents,
        discountCents: dc,
        lineTotalCents,
      }),
    ),
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    surchargeCents,
    totalCents,
  }
}
