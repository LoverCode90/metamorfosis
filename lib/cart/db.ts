import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { CartItem } from "@/lib/types"

interface DbCartItem {
  id: string
  cart_id: string
  variation_id: string
  quantity: number
  product_variations: {
    id: string
    square_variation_id: string
    square_product_id: string
    name_en: string
    price_cents: number
    inventory_count: number
    hex_color: string | null
    shade_number: string | null
    size_label: string | null
    image_url: string | null
    is_active: boolean
    product_translations: {
      name_en: string
      image_url: string | null
      is_professional: boolean
      is_color_product: boolean
      is_returnable: boolean
      is_active: boolean
    } | null
  } | null
}

/** Get or create the authenticated user's cart. Returns the cart id. */
export async function getOrCreateCart(userId: string): Promise<string> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single()

  if (error || !created) throw new Error("Failed to create cart")
  return created.id
}

/** Load all cart items for a user and map to CartItem[]. */
export async function loadCartFromDb(userId: string): Promise<CartItem[]> {
  const supabase = await createClient()

  const cartId = await getOrCreateCart(userId)

  const { data } = await supabase
    .from("cart_items")
    .select(
      `id, cart_id, variation_id, quantity,
       product_variations(
         id, square_variation_id, square_product_id, name_en,
         price_cents, inventory_count, hex_color, shade_number,
         size_label, image_url, is_active,
         product_translations(
           name_en, image_url, is_professional, is_color_product,
           is_returnable, is_active
         )
       )`,
    )
    .eq("cart_id", cartId)

  return ((data as DbCartItem[] | null) ?? [])
    .filter((row) => row.product_variations !== null)
    .map((row) => {
      const v = row.product_variations!
      const p = v.product_translations
      return {
        id: v.square_product_id,
        variationId: v.id,
        squareVariationId: v.square_variation_id,
        name: p?.name_en ?? v.name_en,
        variant: v.shade_number ?? v.size_label ?? v.name_en,
        image: v.image_url ?? p?.image_url ?? "",
        unitPrice: v.price_cents,
        discountPerItem: 0,
        stock: v.inventory_count,
        quantity: row.quantity,
        isProfessional: p?.is_professional ?? false,
        isColorProduct: p?.is_color_product ?? false,
        isReturnable: p?.is_returnable ?? true,
        unavailable: !v.is_active || !p?.is_active,
      }
    })
}

/** Upsert one item in the authenticated cart. */
export async function upsertCartItem(
  userId: string,
  variationId: string,
  quantity: number,
): Promise<void> {
  const supabase = await createClient()
  const cartId = await getOrCreateCart(userId)

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("variation_id", variationId)
    .single()

  if (existing) {
    await supabase.from("cart_items").update({ quantity }).eq("id", existing.id)
  } else {
    await supabase
      .from("cart_items")
      .insert({ cart_id: cartId, variation_id: variationId, quantity })
  }
}

/** Remove one item from the authenticated cart. */
export async function removeCartItem(
  userId: string,
  variationId: string,
): Promise<void> {
  const supabase = await createClient()
  const cartId = await getOrCreateCart(userId)

  await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId)
    .eq("variation_id", variationId)
}

/** Clear the entire authenticated cart (called after order is placed). */
export async function clearDbCart(userId: string): Promise<void> {
  const supabase = await createClient()
  const cartId = await getOrCreateCart(userId)

  await supabase.from("cart_items").delete().eq("cart_id", cartId)
}

/** Merge localStorage items into the Supabase cart on login. */
export async function mergeGuestCart(
  userId: string,
  guestItems: { variationId: string; quantity: number }[],
): Promise<void> {
  const supabase = await createClient()
  const cartId = await getOrCreateCart(userId)

  for (const item of guestItems) {
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("variation_id", item.variationId)
      .single()

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: Math.max(existing.quantity, item.quantity) })
        .eq("id", existing.id)
    } else {
      await supabase.from("cart_items").insert({
        cart_id: cartId,
        variation_id: item.variationId,
        quantity: item.quantity,
      })
    }
  }
}
