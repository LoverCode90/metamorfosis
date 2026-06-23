import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"

interface DbWishlistRow {
  id: string
  product_id: string
  variation_id: string | null
  product_translations: {
    name_en: string
    image_url: string | null
    is_professional: boolean
    is_color_product: boolean
    is_active: boolean
  } | null
  product_variations: {
    id: string
    square_variation_id: string
    name_en: string
    price_cents: number
    inventory_count: number
    shade_number: string | null
    size_label: string | null
    image_url: string | null
    is_active: boolean
  } | null
}

export async function loadWishlistFromDb(userId: string): Promise<Product[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("wishlists")
    .select(
      `id, product_id, variation_id,
       product_translations(
         name_en, image_url, is_professional, is_color_product, is_active
       ),
       product_variations(
         id, square_variation_id, name_en, price_cents,
         inventory_count, shade_number, size_label, image_url, is_active
       )`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return ((data as DbWishlistRow[] | null) ?? [])
    .filter((row) => row.product_translations !== null)
    .map((row) => {
      const p = row.product_translations!
      const v = row.product_variations
      return {
        id: row.product_id,
        variationId: v?.id,
        squareVariationId: v?.square_variation_id,
        name: p.name_en,
        variant: v ? (v.shade_number ?? v.size_label ?? v.name_en) : "",
        image: v?.image_url ?? p.image_url ?? "",
        unitPrice: v?.price_cents ?? 0,
        discountPerItem: 0,
        stock: v?.inventory_count ?? 0,
        isProfessional: p.is_professional,
        isColorProduct: p.is_color_product,
      }
    })
}

export async function addToWishlistDb(
  userId: string,
  productId: string,
  variationId?: string,
): Promise<void> {
  const supabase = await createClient()

  const checkQuery = supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)

  const { data: existing } = variationId
    ? await checkQuery.eq("variation_id", variationId).maybeSingle()
    : await checkQuery.is("variation_id", null).maybeSingle()

  if (!existing) {
    await supabase.from("wishlists").insert({
      user_id: userId,
      product_id: productId,
      variation_id: variationId ?? null,
    })
  }
}

export async function removeFromWishlistDb(
  userId: string,
  productId: string,
  variationId?: string,
): Promise<void> {
  const supabase = await createClient()

  const query = supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId)

  if (variationId) {
    await query.eq("variation_id", variationId)
  } else {
    await query.is("variation_id", null)
  }
}
