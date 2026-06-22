import "server-only"

import type { CatalogObject } from "square"
import { createSquareClient } from "./client"
import {
  getBoolAttr,
  getColorChartPdfUrl,
  getColorFamily,
  getHexColorAttr,
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

interface CategoryNode {
  id: string
  name: string
  parentId: string | null
}

/**
 * Square priceMoney.amount is always in the smallest currency unit (cents for USD).
 * Store this integer directly in product_variations.price_cents.
 */
export function parseSquarePriceCents(
  amount: bigint | number | undefined | null,
): number {
  if (amount == null) return 0
  const cents = typeof amount === "bigint" ? Number(amount) : amount
  return Math.round(cents)
}

function resolveImageUrls(
  imageIds: string[],
  imageUrlMap: Map<string, string>,
): string[] {
  const seen = new Set<string>()
  const urls: string[] = []
  for (const id of imageIds) {
    const url = imageUrlMap.get(id)
    if (!url || seen.has(url)) continue
    seen.add(url)
    urls.push(url)
  }
  return urls
}

function buildCategoryHierarchy(
  categoryId: string,
  categoryMap: Map<string, CategoryNode>,
): string | null {
  const node = categoryMap.get(categoryId)
  if (!node) return null

  if (node.parentId) {
    const parent = categoryMap.get(node.parentId)
    if (parent) {
      return `${parent.name} > ${node.name}`
    }
  }

  return node.name
}

function resolveItemCategoryHierarchy(
  itemData: {
    categories?: { id?: string }[] | null
    categoryId?: string | null
    reportingCategory?: { id?: string } | null
  },
  categoryMap: Map<string, CategoryNode>,
): string {
  const categoryIds: string[] = []

  for (const cat of itemData.categories ?? []) {
    if (cat.id) categoryIds.push(cat.id)
  }

  if (categoryIds.length === 0 && itemData.categoryId) {
    categoryIds.push(itemData.categoryId)
  }

  if (categoryIds.length === 0 && itemData.reportingCategory?.id) {
    categoryIds.push(itemData.reportingCategory.id)
  }

  const hierarchies = categoryIds
    .map((id) => buildCategoryHierarchy(id, categoryMap))
    .filter((h): h is string => Boolean(h))

  if (hierarchies.length === 0) return "Uncategorized"
  return hierarchies[0]
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

  const { error: imageUrlsProbeError } = await supabase
    .from("product_translations")
    .select("image_urls")
    .limit(1)
  const hasImageUrlsColumn = !imageUrlsProbeError

  if (!hasImageUrlsColumn) {
    console.warn(
      "[sync] product_translations.image_urls column missing — run docs/migrations/20260619_catalog_sync_fixes.sql",
    )
  }

  // ── 1. Fetch all catalog objects (ITEM, ITEM_VARIATION, IMAGE, CATEGORY) ──
  const allObjects: CatalogObject[] = []
  for await (const obj of await square.catalog.list({
    types: "ITEM,ITEM_VARIATION,IMAGE,CATEGORY,CUSTOM_ATTRIBUTE_DEFINITION",
  })) {
    allObjects.push(obj)
  }

  // ── 2. Build lookup maps from the raw objects ─────────────────────────────

  const selectionMap = new Map<string, string>()
  for (const obj of allObjects) {
    if (obj.type === "CUSTOM_ATTRIBUTE_DEFINITION") {
      const selections =
        obj.customAttributeDefinitionData?.selectionConfig?.allowedSelections
      if (selections) {
        for (const sel of selections) {
          if (sel.uid && sel.name) selectionMap.set(sel.uid, sel.name)
        }
      }
    }
  }

  const imageUrlMap = new Map<string, string>()
  for (const obj of allObjects) {
    if (obj.type === "IMAGE") {
      const url = obj.imageData?.url
      if (obj.id && url) imageUrlMap.set(obj.id, url)
    }
  }

  const categoryMap = new Map<string, CategoryNode>()
  for (const obj of allObjects) {
    if (obj.type !== "CATEGORY" || !obj.id || !obj.categoryData?.name) continue
    categoryMap.set(obj.id, {
      id: obj.id,
      name: obj.categoryData.name,
      parentId: obj.categoryData.parentCategory?.id ?? null,
    })
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

  // ── 3. Fetch inventory counts ─────────────────────────────────────────────
  const allVariationSquareIds = [...variationMap.values()]
    .flat()
    .map((v) => v.id)
    .filter((id): id is string => Boolean(id))

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
    if (item.isDeleted || !item.id) continue
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

    itemCount++

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
      const weightLb = getNumberAttr(vAttrs, "weight_lb")
      const inventoryCount = inventoryCountMap.get(v.id) ?? 0

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
    .filter((o) => o.type === "ITEM" && o.isDeleted && o.id)
    .map((o) => o.id!)

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
