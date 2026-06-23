import "server-only"

import type { CatalogObject } from "square"
import type { CategoryNode } from "./sync-helpers"

export type ItemObject = CatalogObject & { type: "ITEM" }
export type VariationObject = CatalogObject & { type: "ITEM_VARIATION" }

export interface CatalogMaps {
  /** custom-attribute selection UID → human-readable name */
  selectionMap: Map<string, string>
  /** IMAGE object id → CDN url */
  imageUrlMap: Map<string, string>
  /** CATEGORY id → node (with parent) */
  categoryMap: Map<string, CategoryNode>
  items: ItemObject[]
  /** parent ITEM id → its ITEM_VARIATION objects */
  variationMap: Map<string, VariationObject[]>
}

/** Builds the lookup maps the upsert step needs from the raw catalog objects. */
export function buildCatalogMaps(allObjects: CatalogObject[]): CatalogMaps {
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

  const items = allObjects.filter((o): o is ItemObject => o.type === "ITEM")

  const variationMap = new Map<string, VariationObject[]>()
  for (const obj of allObjects) {
    if (obj.type !== "ITEM_VARIATION") continue
    const v = obj as VariationObject
    const parentId = v.itemVariationData?.itemId
    if (!parentId) continue
    if (!variationMap.has(parentId)) variationMap.set(parentId, [])
    variationMap.get(parentId)!.push(v)
  }

  return { selectionMap, imageUrlMap, categoryMap, items, variationMap }
}
