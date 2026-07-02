import "server-only"

import type { CatalogObject } from "square"
import { createSquareClient } from "./client"
import { createAdminClient } from "@/lib/supabase/admin"
import { buildCatalogMaps } from "./sync-maps"
import { upsertItemWithVariations, type UpsertContext } from "./sync-upsert"
import { aggregateInventoryCounts } from "./inventory-sync"

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
  const maps = buildCatalogMaps(allObjects)

  // ── 3. Fetch inventory counts ─────────────────────────────────────────────
  const allVariationSquareIds = [...maps.variationMap.values()]
    .flat()
    .map((v) => v.id)
    .filter((id): id is string => Boolean(id))

  const inventoryCountMap = new Map<string, number>()
  if (allVariationSquareIds.length > 0) {
    const locationId = process.env.SQUARE_LOCATION_ID
    const rawCounts: {
      catalogObjectId?: string | null
      state?: string | null
      quantity?: string | null
      locationId?: string | null
    }[] = []
    for await (const count of await square.inventory.batchGetCounts({
      catalogObjectIds: allVariationSquareIds,
      locationIds: locationId ? [locationId] : undefined,
    })) {
      rawCounts.push(count)
    }
    const aggregated = aggregateInventoryCounts(rawCounts, locationId)
    for (const [id, qty] of aggregated) {
      inventoryCountMap.set(id, qty)
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

  // ── 5. Upsert active items + their variations ─────────────────────────────
  let itemCount = 0
  let variationCount = 0
  const ctx: UpsertContext = {
    supabase,
    maps,
    existingMap,
    inventoryCountMap,
    hasImageUrlsColumn,
  }

  for (const item of maps.items) {
    const variations = await upsertItemWithVariations(item, ctx)
    if (variations !== null) {
      itemCount++
      variationCount += variations
    }
  }

  // ── 6. Deactivate products/variations no longer in Square ───────────────
  const activeProductIds = new Set(
    maps.items.filter((o) => !o.isDeleted && o.id).map((o) => o.id!),
  )

  const activeVariationIds = new Set<string>()
  for (const vars of maps.variationMap.values()) {
    for (const v of vars) {
      if (!v.isDeleted && v.id) activeVariationIds.add(v.id)
    }
  }

  const orphanProductIds = [...existingMap.keys()].filter(
    (id) => !activeProductIds.has(id),
  )

  let deactivated = 0
  if (orphanProductIds.length > 0) {
    const { data: deactivatedRows } = await supabase
      .from("product_translations")
      .update({ is_active: false })
      .in("square_product_id", orphanProductIds)
      .eq("is_active", true)
      .select("square_product_id")

    deactivated = deactivatedRows?.length ?? 0
  }

  const { data: activeDbVariations } = await supabase
    .from("product_variations")
    .select("square_variation_id")
    .eq("is_active", true)

  const orphanVariationIds = (activeDbVariations ?? [])
    .map((row) => row.square_variation_id)
    .filter((id) => !activeVariationIds.has(id))

  if (orphanVariationIds.length > 0) {
    await supabase
      .from("product_variations")
      .update({ is_active: false })
      .in("square_variation_id", orphanVariationIds)
  }

  return { items: itemCount, variations: variationCount, deactivated }
}
