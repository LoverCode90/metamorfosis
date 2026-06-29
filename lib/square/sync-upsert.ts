import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import {
  getBoolAttr,
  getColorChartPdfUrl,
  getColorFamily,
  getHexColorAttr,
  getPackageClass,
  getStringAttr,
} from "./attributes"
import { readShippingWeightLb } from "./variation-weight"
import { translateProductText } from "@/lib/deepl/translate"
import {
  parseSquarePriceCents,
  resolveImageUrls,
  resolveItemCategoryHierarchy,
} from "./sync-helpers"
import type { CatalogMaps, ItemObject } from "./sync-maps"

export interface UpsertContext {
  supabase: SupabaseClient
  maps: CatalogMaps
  existingMap: Map<string, { name_en: string; description_en: string }>
  inventoryCountMap: Map<string, number>
  hasImageUrlsColumn: boolean
}

/**
 * Upserts one Square ITEM and its variations into Supabase. Returns the number
 * of variations written, or null when the item is skipped (deleted / no data).
 */
export async function upsertItemWithVariations(
  item: ItemObject,
  ctx: UpsertContext,
): Promise<number | null> {
  if (item.isDeleted || !item.id) return null
  const d = item.itemData
  if (!d) return null

  const { supabase, maps, existingMap, inventoryCountMap, hasImageUrlsColumn } =
    ctx
  const { categoryMap, imageUrlMap, selectionMap, variationMap } = maps

  const nameEn = d.name ?? ""
  const descriptionEn = d.description ?? d.descriptionHtml ?? ""
  const attrs = item.customAttributeValues
  const existing = existingMap.get(item.id)

  const textChanged =
    !existing ||
    existing.name_en !== nameEn ||
    existing.description_en !== descriptionEn

  let nameEs = existing ? undefined : nameEn
  let descriptionEs = existing ? undefined : descriptionEn

  if (textChanged) {
    const translated = await translateProductText(nameEn, descriptionEn)
    nameEs = translated.nameEs
    descriptionEs = translated.descriptionEs
  }

  const categoriesHierarchy = resolveItemCategoryHierarchy(d, categoryMap)

  const imageIds = [
    ...(item.imageId ? [item.imageId] : []),
    ...(d.imageIds ?? []),
  ]
  const imageUrls = resolveImageUrls(imageIds, imageUrlMap)
  const imageUrl = imageUrls[0] ?? null

  const productRow = {
    square_product_id: item.id,
    name_en: nameEn,
    description_en: descriptionEn,
    ...(textChanged && nameEs !== undefined ? { name_es: nameEs } : {}),
    ...(textChanged && descriptionEs !== undefined
      ? { description_es: descriptionEs }
      : {}),
    categories_hierarchy: categoriesHierarchy,
    image_url: imageUrl,
    ...(hasImageUrlsColumn ? { image_urls: imageUrls } : {}),
    is_professional: getBoolAttr(attrs, "is_professional") ?? false,
    is_returnable: getBoolAttr(attrs, "is_returnable") ?? true,
    package_class: getPackageClass(attrs, selectionMap),
    is_color_product: getBoolAttr(attrs, "is_color_product") ?? false,
    color_family: getColorFamily(attrs, selectionMap),
    color_chart_pdf_url: getColorChartPdfUrl(attrs),
    is_active: true,
  }

  const insertRow = {
    ...productRow,
    name_es: nameEs ?? nameEn,
    description_es: descriptionEs ?? descriptionEn,
  }

  await supabase
    .from("product_translations")
    .upsert(insertRow, { onConflict: "square_product_id" })

  let variationCount = 0
  const vars = variationMap.get(item.id) ?? []
  for (const v of vars) {
    if (v.isDeleted || !v.id) continue
    const vd = v.itemVariationData
    if (!vd) continue

    const varNameEn = vd.name ?? ""
    const priceCents = parseSquarePriceCents(vd.priceMoney?.amount)

    const vAttrs = v.customAttributeValues
    const hexColor = getHexColorAttr(vAttrs, "hex_color")
    const shadeNumber = getStringAttr(vAttrs, "shade_number")
    const weightLb = readShippingWeightLb(vd, vAttrs)
    const inventoryCount = inventoryCountMap.get(v.id) ?? 0

    const varImageId = v.imageId ?? null
    const varImageUrl =
      (varImageId ? imageUrlMap.get(varImageId) : undefined) ?? imageUrl ?? null

    const varRow = {
      square_variation_id: v.id,
      square_product_id: item.id,
      sku: vd.sku ?? null,
      name_en: varNameEn,
      name_es: varNameEn,
      price_cents: priceCents,
      weight_lb: weightLb,
      inventory_count: inventoryCount,
      hex_color: hexColor,
      shade_number: shadeNumber,
      size_label: !hexColor && !shadeNumber ? varNameEn : null,
      image_url: varImageUrl,
      is_active: true,
    }

    await supabase
      .from("product_variations")
      .upsert(varRow, { onConflict: "square_variation_id" })

    variationCount++
  }

  return variationCount
}
