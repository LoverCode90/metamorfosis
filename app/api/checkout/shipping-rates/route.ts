import { NextRequest, NextResponse } from "next/server"
import {
  SHIPPING_RATES_CENTS,
  computeShippingCents,
} from "@/lib/checkout/totals"
import type { ShippingRate } from "@/lib/checkout/types"

const FREE_THRESHOLD_CENTS = parseInt(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS ?? "7000",
  10,
)

/**
 * POST /api/checkout/shipping-rates
 * Returns available shipping options based on the current subtotal.
 * Phase 5: fixed rates. Phase 6: replaced with real Shippo rates.
 * Body: { subtotalCents: number }
 */
export async function POST(request: NextRequest) {
  const { subtotalCents } = (await request.json()) as { subtotalCents: number }

  if (typeof subtotalCents !== "number" || subtotalCents < 0) {
    return NextResponse.json(
      { error: "Invalid subtotalCents" },
      { status: 400 },
    )
  }

  const standardCents = computeShippingCents("standard", subtotalCents)
  const isFreeStandard = standardCents === 0 && subtotalCents > 0

  const rates: ShippingRate[] = [
    {
      method: "standard",
      label: "Standard Shipping",
      description: "Tracked via USPS · 5–7 business days",
      amountCents: standardCents,
      display: isFreeStandard
        ? "FREE"
        : `$${(SHIPPING_RATES_CENTS.standard / 100).toFixed(2)}`,
    },
    {
      method: "express",
      label: "Express Shipping",
      description: "2–3 business days",
      amountCents: SHIPPING_RATES_CENTS.express,
      display: `$${(SHIPPING_RATES_CENTS.express / 100).toFixed(2)}`,
    },
    {
      method: "overnight",
      label: "Overnight",
      description: "Next business day",
      amountCents: SHIPPING_RATES_CENTS.overnight,
      display: `$${(SHIPPING_RATES_CENTS.overnight / 100).toFixed(2)}`,
    },
    {
      method: "pickup",
      label: "Pick Up in Store",
      description: "Ontario, CA — free",
      amountCents: 0,
      display: "FREE",
    },
  ]

  const freeThresholdNote =
    !isFreeStandard && subtotalCents > 0
      ? `Add $${((FREE_THRESHOLD_CENTS - subtotalCents) / 100).toFixed(2)} more for free standard shipping`
      : undefined

  return NextResponse.json({ rates, freeThresholdNote })
}
