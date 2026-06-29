import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buildParcels, type ParcelItem } from "@/lib/shipping/build-parcels"
import { fetchLiveRates } from "@/lib/shippo/live-rates"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import type { CheckoutAddress, LiveShippingRate } from "@/lib/checkout/types"
import type { PackageClass } from "@/lib/square/attributes"

interface ShippingRatesBody {
  cartItems?: { variationId: string; quantity: number }[]
  destinationAddress?: CheckoutAddress
  subtotalCents?: number
}

interface VariationRow {
  id: string
  weight_lb: number | null
  product_translations: { package_class: PackageClass } | null
}

interface ShippingRatesResponse {
  rates: LiveShippingRate[]
  freeShipping: boolean
  message?: string
}

/**
 * POST /api/checkout/shipping-rates
 *
 * Builds real parcels from the cart (weight + package_class resolved from the
 * DB — never trusted from the client), asks Shippo for live rates, and returns
 * the cheapest rate per carrier (USPS, UPS, FedEx, DHL), price ascending.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as ShippingRatesBody
  const { cartItems, destinationAddress, subtotalCents } = body

  if (!cartItems?.length || !destinationAddress) {
    return NextResponse.json(
      { error: "Missing cart items or destination address" },
      { status: 400 },
    )
  }
  if (!process.env.SHIPPO_API_KEY) {
    return NextResponse.json(
      { error: "Shipping is temporarily unavailable" },
      { status: 503 },
    )
  }

  const freeShipping = (subtotalCents ?? 0) >= FREE_SHIPPING_THRESHOLD * 100

  // Resolve weight + package_class from the DB for accurate, tamper-proof packing.
  const admin = createAdminClient()
  const variationIds = cartItems.map((item) => item.variationId)
  const { data: variationRows } = await admin
    .from("product_variations")
    .select("id, weight_lb, product_translations(package_class)")
    .in("id", variationIds)

  const rowsById = new Map(
    ((variationRows ?? []) as unknown as VariationRow[]).map((row) => [
      row.id,
      row,
    ]),
  )

  const parcelItems: ParcelItem[] = cartItems.map((item) => {
    const row = rowsById.get(item.variationId)
    return {
      packageClass: row?.product_translations?.package_class ?? "small",
      weightLb: row?.weight_lb ?? null,
      quantity: item.quantity,
    }
  })

  const parcels = buildParcels(parcelItems)
  if (parcels.length === 0) {
    const noParcels: ShippingRatesResponse = {
      rates: [],
      freeShipping,
      message:
        "These items ship separately. We'll contact you with shipping details.",
    }
    return NextResponse.json(noParcels)
  }

  try {
    const rates = await fetchLiveRates(destinationAddress, parcels)
    const response: ShippingRatesResponse = { rates, freeShipping }
    return NextResponse.json(response)
  } catch (error) {
    console.error("[shipping-rates] Shippo error:", error)
    return NextResponse.json(
      { error: "Could not fetch shipping rates. Please try again." },
      { status: 502 },
    )
  }
}
