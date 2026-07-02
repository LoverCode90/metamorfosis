import "server-only"
import type { createAdminClient } from "@/lib/supabase/admin"
import { itemLabel } from "@/lib/orders/item-label"
import type { CheckoutPayload } from "./types"

type AdminClient = ReturnType<typeof createAdminClient>
type CheckoutItem = CheckoutPayload["items"][number]

/**
 * Price-ish fields the client must never send — the server computes every
 * amount from Square-synced data. Their presence means a tampered payload.
 */
export const FORBIDDEN_PRICE_FIELDS = [
  "price",
  "total",
  "subtotal",
  "amount",
  "discount",
  "tax",
  "shipping",
  "surcharge_consented_at",
  "surcharge_consented_ip",
  "chemical_warning_consented_at",
  "chemical_warning_consented_ip",
] as const

export function hasTamperedPriceFields(
  payload: Record<string, unknown>,
): boolean {
  return FORBIDDEN_PRICE_FIELDS.some((key) => key in payload)
}

export interface CheckoutVariationRow {
  id: string
  square_variation_id: string
  name_en: string
  price_cents: number
  /** Square-synced; gates online-vs-online contention only — post-purchase counts are webhook-driven */
  inventory_count: number
  is_active: boolean
  product_translations: {
    name_en: string
    is_professional: boolean
    is_color_product: boolean
    is_returnable: boolean
    is_active: boolean
  } | null
}

export type CheckoutVariationMap = Map<string, CheckoutVariationRow>

const VARIATION_SELECT =
  "id, square_variation_id, name_en, price_cents, inventory_count, is_active, product_translations(name_en, is_professional, is_color_product, is_returnable, is_active)"

/**
 * Fetch the variation rows (Square-synced prices/inventory) for the cart and
 * key them by id. Returns null if any requested variation is missing.
 */
export async function fetchVariationMap(
  admin: AdminClient,
  variationIds: string[],
): Promise<CheckoutVariationMap | null> {
  const { data: variationRows } = await admin
    .from("product_variations")
    .select(VARIATION_SELECT)
    .in("id", variationIds)

  if (!variationRows || variationRows.length !== variationIds.length) {
    return null
  }

  return new Map(
    (variationRows as unknown as CheckoutVariationRow[]).map((v) => [v.id, v]),
  )
}

export function hasProfessionalItem(
  items: CheckoutItem[],
  varMap: CheckoutVariationMap,
): boolean {
  return items.some(
    (item) =>
      varMap.get(item.variationId)?.product_translations?.is_professional,
  )
}

export function hasChemicalItems(
  items: CheckoutItem[],
  varMap: CheckoutVariationMap,
): boolean {
  return items.some(
    (item) =>
      varMap.get(item.variationId)?.product_translations?.is_returnable ===
      false,
  )
}

export function buildDiscountableItems(
  items: CheckoutItem[],
  varMap: CheckoutVariationMap,
) {
  return items.map((i) => {
    const v = varMap.get(i.variationId)!
    return {
      variationId: i.variationId,
      name: itemLabel(v.product_translations?.name_en, v.name_en),
      quantity: i.quantity,
      unitPriceCents: v.price_cents,
      isColorProduct: v.product_translations?.is_color_product ?? false,
    }
  })
}
