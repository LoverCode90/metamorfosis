import { NextRequest, NextResponse } from "next/server"
import {
  SHIPPING_RATES_CENTS,
  computeShippingCents,
} from "@/lib/checkout/totals"
import type { ShippingRate } from "@/lib/checkout/types"
import type { CheckoutAddress } from "@/lib/checkout/types"
import { packItems, type PackInput } from "@/lib/shippo/packing"
import { fetchShippoRates } from "@/lib/shippo/rates"
import { createAdminClient } from "@/lib/supabase/admin"
import type { PackageClass } from "@/lib/square/attributes"

interface ShippingRatesBody {
  subtotalCents: number
  address?: CheckoutAddress
  /** cart items with quantities for accurate packing */
  items?: { variationId: string; quantity: number }[]
}

const FREE_THRESHOLD_CENTS = parseInt(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS ?? "7000",
  10,
)

/**
 * POST /api/checkout/shipping-rates
 *
 * When `address` and `variationIds` are provided: fetches live Shippo rates
 * using the packing algorithm (with DB-resolved packageClass + weightLb).
 * Falls back to fixed rates when Shippo is unavailable or address is absent.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as ShippingRatesBody
  const { subtotalCents, address, items } = body

  if (typeof subtotalCents !== "number" || subtotalCents < 0) {
    return NextResponse.json(
      { error: "Invalid subtotalCents" },
      { status: 400 },
    )
  }

  const isFreeStandard =
    subtotalCents >= FREE_THRESHOLD_CENTS && subtotalCents > 0

  if (process.env.NODE_ENV === "development") {
    console.log(
      "[shipping-rates] Calling Shippo with address:",
      address?.city,
      address?.state,
    )
  }

  // ── Attempt live Shippo rates ─────────────────────────────────────────────
  if (address && items && items.length > 0 && process.env.SHIPPO_API_KEY) {
    try {
      // Resolve packageClass + weightLb from the DB so client doesn't need them
      const admin = createAdminClient()
      const variationIds = items.map((i) => i.variationId)
      const { data: varRows } = await admin
        .from("product_variations")
        .select(
          "id, weight_lb, quantity:inventory_count, product_translations(package_class)",
        )
        .in("id", variationIds)

      // Map variationId → pack input using exact quantities from cart
      const packInputs: PackInput[] = (
        varRows as unknown as {
          id: string
          weight_lb: number | null
          product_translations: { package_class: PackageClass } | null
        }[]
      ).map((row) => {
        const cartItem = items.find((i) => i.variationId === row.id)
        return {
          packageClass: row.product_translations?.package_class ?? "small",
          weightLb: row.weight_lb,
          quantity: cartItem?.quantity ?? 1,
        }
      })

      const { parcels, oversized } = packItems(packInputs)

      if (oversized) {
        return NextResponse.json({
          oversized: true,
          rates: [],
          message:
            "One or more items require special handling. Please contact us to complete this order.",
        })
      }

      const shippoRates = await fetchShippoRates(address, parcels)

      const standardCents = isFreeStandard
        ? 0
        : (shippoRates.standardCents ?? SHIPPING_RATES_CENTS.standard)
      const expressCents =
        shippoRates.expressCents ?? SHIPPING_RATES_CENTS.express
      const overnightCents =
        shippoRates.overnightCents ?? SHIPPING_RATES_CENTS.overnight

      const rates: ShippingRate[] = [
        {
          method: "standard",
          label: "Standard Shipping",
          description: "Tracked via USPS · 5–7 business days",
          amountCents: standardCents,
          display: isFreeStandard
            ? "FREE"
            : `$${(standardCents / 100).toFixed(2)}`,
        },
        {
          method: "express",
          label: "Express Shipping",
          description: "2–3 business days",
          amountCents: expressCents,
          display: `$${(expressCents / 100).toFixed(2)}`,
        },
        {
          method: "overnight",
          label: "Overnight",
          description: "Next business day",
          amountCents: overnightCents,
          display: `$${(overnightCents / 100).toFixed(2)}`,
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
    } catch (err) {
      console.error(
        "[shipping-rates] Shippo error — falling back to fixed rates:",
        err,
      )
      // Fall through to fixed rates
    }
  }

  // ── Fixed-rate fallback (no address yet, or Shippo unavailable) ───────────
  const standardCents = computeShippingCents("standard", subtotalCents)

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
