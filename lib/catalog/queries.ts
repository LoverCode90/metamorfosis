import "server-only"

import { createClient } from "@/lib/supabase/server"
import {
  mapCard,
  mapProduct,
  mapVariation,
  type DbProductRow,
  type DbVariationRow,
} from "./mappers"
import type { CatalogCard, CatalogProduct, CatalogVariation } from "./types"

const PRODUCT_COLS = `
  square_product_id,
  name_en,
  description_en,
  categories_hierarchy,
  is_professional,
  is_returnable,
  is_color_product,
  color_family,
  color_chart_pdf_url,
  image_url,
  is_active,
  recommended_skus
`.trim()

/**
 * Catalog grid — returns one card per active product with min price + total stock.
 * Runs a DB-level aggregate to avoid fetching all variations for every card.
 */
export async function fetchCatalogCards(): Promise<CatalogCard[]> {
  const supabase = await createClient()

  // Use Supabase RPC or a join query. We join product_variations inline.
  const { data, error } = await supabase
    .from("product_translations")
    .select(
      `
      ${PRODUCT_COLS},
      product_variations!inner(price_cents, inventory_count, is_active)
    `,
    )
    .eq("is_active", true)
    .eq("product_variations.is_active", true)

  if (error) {
    console.error("[catalog/queries] fetchCatalogCards error:", error)
    return []
  }

  // Group variations per product and compute min price + total stock
  const rows = (data ?? []) as unknown as (DbProductRow & {
    product_variations: {
      price_cents: number
      inventory_count: number
      is_active: boolean
    }[]
  })[]

  return rows.map((row) => {
    const vars = row.product_variations ?? []
    const min_price_cents =
      vars.length > 0 ? Math.min(...vars.map((v) => v.price_cents)) : 0
    const total_stock = vars.reduce((s, v) => s + v.inventory_count, 0)
    return mapCard({ ...row, min_price_cents, total_stock })
  })
}

/**
 * Product detail page — returns full product with all active variations.
 */
export async function fetchProductDetail(
  squareProductId: string,
): Promise<CatalogProduct | null> {
  const supabase = await createClient()

  const { data: productData, error: productError } = await supabase
    .from("product_translations")
    .select(PRODUCT_COLS)
    .eq("square_product_id", squareProductId)
    .eq("is_active", true)
    .single<DbProductRow>()

  if (productError || !productData) {
    return null
  }

  const { data: varData } = await supabase
    .from("product_variations")
    .select(
      "id, square_variation_id, square_product_id, sku, name_en, price_cents, weight_lb, inventory_count, hex_color, shade_number, size_label, image_url, is_active",
    )
    .eq("square_product_id", squareProductId)
    .eq("is_active", true)
    .order("shade_number", { ascending: true })

  return mapProduct(productData, (varData ?? []) as DbVariationRow[])
}

/**
 * Resolve related products from recommended_skus or same-category fallback.
 */
export async function fetchRelatedProducts(
  recommendedSkus: string[],
  categoriesHierarchy: string,
  excludeId: string,
  limit = 4,
): Promise<CatalogCard[]> {
  const supabase = await createClient()

  if (recommendedSkus.length > 0) {
    const { data: varRows } = await supabase
      .from("product_variations")
      .select("square_product_id")
      .in("sku", recommendedSkus)
      .eq("is_active", true)

    const ids = [
      ...new Set(
        (varRows ?? []).map(
          (v: { square_product_id: string }) => v.square_product_id,
        ),
      ),
    ].filter((id) => id !== excludeId)

    if (ids.length > 0) {
      const { data } = await supabase
        .from("product_translations")
        .select(
          `${PRODUCT_COLS}, product_variations!inner(price_cents, inventory_count, is_active)`,
        )
        .in("square_product_id", ids)
        .eq("is_active", true)
        .eq("product_variations.is_active", true)
        .limit(limit)

      if (data && data.length > 0) {
        return (
          data as unknown as (DbProductRow & {
            product_variations: {
              price_cents: number
              inventory_count: number
              is_active: boolean
            }[]
          })[]
        ).map((row) => {
          const vars = row.product_variations ?? []
          return mapCard({
            ...row,
            min_price_cents:
              vars.length > 0 ? Math.min(...vars.map((v) => v.price_cents)) : 0,
            total_stock: vars.reduce((s, v) => s + v.inventory_count, 0),
          })
        })
      }
    }
  }

  // Fallback: same category
  const topCategory = categoriesHierarchy.split(" > ")[0] ?? "Uncategorized"
  const { data: fallbackData } = await supabase
    .from("product_translations")
    .select(
      `${PRODUCT_COLS}, product_variations!inner(price_cents, inventory_count, is_active)`,
    )
    .ilike("categories_hierarchy", `${topCategory}%`)
    .neq("square_product_id", excludeId)
    .eq("is_active", true)
    .eq("product_variations.is_active", true)
    .limit(limit)

  return (
    (fallbackData ?? []) as unknown as (DbProductRow & {
      product_variations: {
        price_cents: number
        inventory_count: number
        is_active: boolean
      }[]
    })[]
  ).map((row) => {
    const vars = row.product_variations ?? []
    return mapCard({
      ...row,
      min_price_cents:
        vars.length > 0 ? Math.min(...vars.map((v) => v.price_cents)) : 0,
      total_stock: vars.reduce((s, v) => s + v.inventory_count, 0),
    })
  })
}

/**
 * Distinct category list derived from product_translations.categories_hierarchy.
 * Used to populate the filter panel dynamically.
 */
export async function getFilterFacets(): Promise<{
  categories: string[]
  maxPrice: number
}> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("product_translations")
    .select("categories_hierarchy, product_variations(price_cents, is_active)")
    .eq("is_active", true)

  const categorySet = new Set<string>()
  let maxPriceCents = 0

  for (const row of data ?? []) {
    const top = (row.categories_hierarchy as string).split(" > ")[0]?.trim()
    if (top) categorySet.add(top)

    for (const v of (row.product_variations as {
      price_cents: number
      is_active: boolean
    }[]) ?? []) {
      if (v.is_active && v.price_cents > maxPriceCents) {
        maxPriceCents = v.price_cents
      }
    }
  }

  return {
    categories: [...categorySet].sort(),
    maxPrice: maxPriceCents / 100,
  }
}

/**
 * Fetch a single variation by its UUID (for cart/checkout use).
 */
export async function fetchVariation(
  variationId: string,
): Promise<CatalogVariation | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("product_variations")
    .select(
      "id, square_variation_id, square_product_id, sku, name_en, price_cents, weight_lb, inventory_count, hex_color, shade_number, size_label, image_url, is_active",
    )
    .eq("id", variationId)
    .single<DbVariationRow>()

  return data ? mapVariation(data) : null
}
