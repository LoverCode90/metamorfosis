import "server-only"

import { getNumberAttr, type AttrMap } from "./attributes"

/** Reads a finite numeric property from an unknown object across candidate keys. */
function readNumericField(source: unknown, keys: string[]): number | null {
  if (!source || typeof source !== "object") return null
  const record = source as Record<string, unknown>
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "number" && Number.isFinite(value)) return value
    if (typeof value === "string") {
      const parsed = parseFloat(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return null
}

let loggedRawShape = false

/**
 * Resolves a variation's shipping weight in pounds.
 *
 * Square's "Shipping weight" (Fulfill orders) is Online-store fulfillment data
 * that the Catalog API SDK does not type on CatalogItemVariation. We read it
 * defensively from the raw variation object in case it is present untyped,
 * then fall back to a `weight_lb` custom attribute, then null (the packing
 * algorithm applies per-class defaults when weight is unknown).
 *
 * On the first variation of a sync it logs the raw object keys so the exact
 * field name can be confirmed against a live catalog response.
 */
export function readShippingWeightLb(
  variationData: unknown,
  attrs: AttrMap,
): number | null {
  if (!loggedRawShape && variationData && typeof variationData === "object") {
    loggedRawShape = true
    console.log(
      "[sync] variation data keys:",
      Object.keys(variationData as Record<string, unknown>),
    )
  }

  const nativeWeightLb = readNumericField(variationData, [
    "weight",
    "weightLb",
    "shippingWeight",
    "shipping_weight",
  ])
  if (nativeWeightLb != null) return nativeWeightLb

  return getNumberAttr(attrs, "weight_lb")
}
