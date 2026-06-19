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
 * Full catalog sync: fetch all Square ITEM / ITEM_VARIATION / IMAGE / CATEGORY
 * objects, upsert into Supabase, translate with DeepL only when EN text changed.
 *
 * Call this from the Square webhook handler or the admin manual-trigger route.
 */
export async function runFullCatalogSync(): Promise<SyncStats> {
  const square = createSquareClient()
  const supabase = createAdminClient()

  // ── 1. Fetch all catalog objects (ITEM, ITEM_VARIATION, IMAGE, CATEGORY) ──
  const allObjects: CatalogObject[] = []
  for await (const obj of await square.catalog.list({
    types: "ITEM,ITEM_VARIATION,IMAGE,CATEGORY",
  })) {
    allObjects.push(obj)
  }

  // ── 2. Build lookup maps from the raw objects ─────────────────────────────

  // imageId → CDN URL (from CatalogObject type=IMAGE)
  // CatalogObjectImage has an `imageData` field (not `catalogImageData`).
  const imageUrlMap = new Map<string, string>()
  for (const obj of allObjects) {
    if (obj.type === "IMAGE") {
      const url = obj.imageData?.url
      if (obj.id && url) imageUrlMap.set(obj.id, url)
    }
  }

  // categoryId → display name (from CatalogObject type=CATEGORY)
  const categoryNameMap = new Map<string, string>()
  for (const obj of allObjects) {
    if (obj.type === "CATEGORY" && obj.id && obj.categoryData?.name) {
      categoryNameMap.set(obj.id, obj.categoryData.name)
    }
  }

  // items and their variations
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

  // ── 3. Fetch inventory counts ─────────────────────────────────────────────
  const allVariationSquareIds = [...variationMap.values()]
    .flat()
    .map((v) => v.id)

  const inventoryCountMap = new Map<string, number>()
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

  // ── 4. Fetch existing EN text for DeepL change detection ─────────────────
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

  // ── 5. Upsert active items ────────────────────────────────────────────────
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

    // ── Resolve category names ─────────────────────────────────────────────
    // d.categories is CatalogItemCategory[] — each has `.id` which is the
    // CatalogObject.id of the corresponding CATEGORY object.
    // The name lives on the CATEGORY object, not inline here.
    const categories = d.categories ?? []
    const categoryNames: string[] = []
    for (const cat of categories) {
      // cat.id is the category CatalogObject ID
      const catId = cat.id
      if (!catId) continue
      const name = categoryNameMap.get(catId)
      if (name) categoryNames.push(name)
    }
    const categoriesHierarchy =
      categoryNames.length > 0 ? categoryNames.join(" > ") : "Uncategorized"

    // ── Resolve product image URL ──────────────────────────────────────────
    // item.imageId (on CatalogObjectBase) is the primary image ID.
    // Falls back to d.imageIds[0] (the first of the ordered image list).
    const primaryImageId = item.imageId ?? d.imageIds?.[0] ?? null
    const imageUrl = primaryImageId
      ? (imageUrlMap.get(primaryImageId) ?? null)
      : null

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

      // priceMoney.amount is a BigInt in the Square SDK
      const priceCents =
        typeof vd.priceMoney?.amount === "bigint"
          ? Number(vd.priceMoney.amount)
          : ((vd.priceMoney?.amount as number | undefined) ?? 0)

      const vAttrs = v.customAttributeValues
      const hexColor = getStringAttr(vAttrs, "hex_color")
      const shadeNumber = getStringAttr(vAttrs, "shade_number")
      const weightLb = getNumberAttr(vAttrs, "weight_lb")
      const inventoryCount = inventoryCountMap.get(v.id) ?? 0

      // Variation-level image: v.imageId is the primary image on the CatalogObject.
      // Falls back to the parent item's primary image so the card always has art.
      const varImageId = v.imageId ?? null
      const varImageUrl =
        (varImageId ? imageUrlMap.get(varImageId) : undefined) ??
        imageUrl ??
        null

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
  }

  // ── 6. Soft-delete items marked is_deleted by Square ─────────────────────
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
