// Shared calculation logic for both server and client components

import {
  CARD_SURCHARGE_RATE,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
} from "@/lib/constants"
import type { PriceSheet, ShippingMethod } from "./types"

/** Fixed shipping rates in cents (Phase 5 — Shippo replaces in Phase 6). */
export const SHIPPING_RATES_CENTS: Record<ShippingMethod, number> = {
  standard: 700,
  express: 1500,
  overnight: 2500,
  pickup: 0,
}

export function computeShippingCents(
  method: ShippingMethod,
  subtotalCents: number,
): number {
  if (method === "pickup") return 0
  if (method === "standard" && subtotalCents >= FREE_SHIPPING_THRESHOLD * 100) {
    return 0
  }
  return SHIPPING_RATES_CENTS[method]
}

export function buildPriceSheet(
  itemsWithDiscount: {
    variationId: string
    name: string
    quantity: number
    unitPriceCents: number
    discountCents: number
  }[],
  shippingMethod: ShippingMethod,
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
  const shippingCents = computeShippingCents(
    shippingMethod,
    subtotalCents - discountCents,
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
