import "server-only"

import type { CatalogObject } from "square"
import { createSquareClient } from "./client"
import {
  getBoolAttr,
  getColorFamily,
  getNumberAttr,
  getPackageClass,
  getStringAttr,
} from "./attributes"
import { translateProductText } from "@/lib/deepl/translate"
import { createAdminClient } from "@/lib/supabase/admin"

export interface SyncStats {
  items: number
  variations: number
  deactivated: number
}

/**
 * Full catalog sync: fetch all Square ITEM / ITEM_VARIATION objects, upsert
 * into Supabase, translate with DeepL only when EN text changed.
 *
 * Call this from the Square webhook handler or the admin manual-trigger route.
 */
export async function runFullCatalogSync(): Promise<SyncStats> {
  const square = createSquareClient()
  const supabase = createAdminClient()

  // ── 1. Fetch all catalog objects ─────────────────────────────────────────
  const allObjects: CatalogObject[] = []
  for await (const obj of await square.catalog.list({
    types: "ITEM,ITEM_VARIATION",
  })) {
    allObjects.push(obj)
  }

  const items = allObjects.filter(
    (o): o is CatalogObject & { type: "ITEM" } => o.type === "ITEM",
  )
  const variationMap = new Map<
    string,
    (CatalogObject & { type: "ITEM_VARIATION" })[]
  >()

  for (const obj of allObjects) {
    if (obj.type !== "ITEM_VARIATION") continue
    const v = obj as CatalogObject & { type: "ITEM_VARIATION" }
    const parentId = v.itemVariationData?.itemId
    if (!parentId) continue
    if (!variationMap.has(parentId)) variationMap.set(parentId, [])
    variationMap.get(parentId)!.push(v)
  }

  // ── 2. Fetch inventory counts ─────────────────────────────────────────────
  const allVariationSquareIds = [...variationMap.values()]
    .flat()
    .map((v) => v.id)

  const inventoryCountMap = new Map<string, number>() // square_variation_id → count
  if (allVariationSquareIds.length > 0) {
    const locationId = process.env.SQUARE_LOCATION_ID
    for await (const count of await square.inventory.batchGetCounts({
      catalogObjectIds: allVariationSquareIds,
      locationIds: locationId ? [locationId] : undefined,
    })) {
      if (
        count.catalogObjectId &&
        count.state === "IN_STOCK" &&
        count.quantity
      ) {
        const current = inventoryCountMap.get(count.catalogObjectId) ?? 0
        inventoryCountMap.set(
          count.catalogObjectId,
          current + Math.floor(parseFloat(count.quantity)),
        )
      }
    }
  }

  // ── 3. Fetch existing EN text for change detection ────────────────────────
  const { data: existingProducts } = await supabase
    .from("product_translations")
    .select("square_product_id, name_en, description_en")

  const existingMap = new Map<
    string,
    { name_en: string; description_en: string }
  >()
  for (const row of existingProducts ?? []) {
    existingMap.set(row.square_product_id, {
      name_en: row.name_en,
      description_en: row.description_en,
    })
  }

  // ── 4. Upsert active items ────────────────────────────────────────────────
  let itemCount = 0
  let variationCount = 0

  for (const item of items) {
    if (item.isDeleted) continue
    const d = item.itemData
    if (!d) continue

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

    // Derive categories_hierarchy from Square category data
    // CatalogItem.categories is an array of CatalogItemCategory objects
    const categories = d.categories ?? []
    const categoryNames: string[] = []
    for (const cat of categories) {
      const n = cat.categoryData?.name
      if (n) categoryNames.push(n)
    }
    const categoriesHierarchy =
      categoryNames.length > 0 ? categoryNames.join(" > ") : "Uncategorized"

    const productRow = {
      square_product_id: item.id,
      name_en: nameEn,
      description_en: descriptionEn,
      ...(textChanged && nameEs !== undefined ? { name_es: nameEs } : {}),
      ...(textChanged && descriptionEs !== undefined
        ? { description_es: descriptionEs }
        : {}),
      categories_hierarchy: categoriesHierarchy,
      is_professional: getBoolAttr(attrs, "is_professional") ?? false,
      is_returnable: getBoolAttr(attrs, "is_returnable") ?? true,
      package_class: getPackageClass(attrs),
      is_color_product: getBoolAttr(attrs, "is_color_product") ?? false,
      color_family: getColorFamily(attrs),
      color_chart_pdf_url: getStringAttr(attrs, "color_chart_pdf_url"),
      is_active: true,
    }

    // For new rows we must include name_es / description_es (non-null columns)
    const insertRow = {
      ...productRow,
      name_es: nameEs ?? nameEn,
      description_es: descriptionEs ?? descriptionEn,
    }

    await supabase
      .from("product_translations")
      .upsert(insertRow, { onConflict: "square_product_id" })

    itemCount++

    // ── Upsert variations for this item ──────────────────────────────────────
    const vars = variationMap.get(item.id) ?? []
    for (const v of vars) {
      if (v.isDeleted) continue
      const vd = v.itemVariationData
      if (!vd) continue

      const varNameEn = vd.name ?? ""
      const priceCents =
        typeof vd.priceMoney?.amount === "bigint"
          ? Number(vd.priceMoney.amount)
          : ((vd.priceMoney?.amount as number | undefined) ?? 0)

      const vAttrs = v.customAttributeValues
      const hexColor = getStringAttr(vAttrs, "hex_color")
      const shadeNumber = getStringAttr(vAttrs, "shade_number")
      const weightLb = getNumberAttr(vAttrs, "weight_lb")
      const inventoryCount = inventoryCountMap.get(v.id) ?? 0

      const varRow = {
        square_variation_id: v.id,
        square_product_id: item.id,
        sku: vd.sku ?? null,
        name_en: varNameEn,
        name_es: varNameEn, // Variation names are typically shade codes — not worth translating
        price_cents: priceCents,
        weight_lb: weightLb,
        inventory_count: inventoryCount,
        hex_color: hexColor,
        shade_number: shadeNumber,
        size_label: !hexColor && !shadeNumber ? varNameEn : null,
        is_active: true,
      }

      await supabase
        .from("product_variations")
        .upsert(varRow, { onConflict: "square_variation_id" })

      variationCount++
    }
  }

  // ── 5. Soft-delete items marked is_deleted by Square ─────────────────────
  const deletedIds = allObjects
    .filter((o) => o.type === "ITEM" && o.isDeleted)
    .map((o) => o.id)

  let deactivated = 0
  if (deletedIds.length > 0) {
    const { data: deactivatedRows } = await supabase
      .from("product_translations")
      .update({ is_active: false })
      .in("square_product_id", deletedIds)
      .select("square_product_id")

    deactivated = deactivatedRows?.length ?? 0
  }

  return { items: itemCount, variations: variationCount, deactivated }
}
