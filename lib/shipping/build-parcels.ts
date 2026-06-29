import type { PackageClass } from "@/lib/square/attributes"

/** A cart item enriched with the data needed to choose a shipping box. */
export interface ParcelItem {
  packageClass: PackageClass
  /** Per-unit weight in pounds (Square `weight_lb`); null uses a class default. */
  weightLb: number | null
  quantity: number
}

/** Shippo parcel shape (snake_case, as the Shippo REST API expects). */
export interface ShippoParcel {
  length: string
  width: string
  height: string
  weight: string
  distance_unit: "in"
  mass_unit: "lb"
}

type ShippableClass = Exclude<PackageClass, "box_set">

interface BoxSpec {
  length: number
  width: number
  height: number
  maxWeightLb: number
}

/** package_class → physical box. */
const BOX_BY_CLASS: Record<ShippableClass, BoxSpec> = {
  tiny: { length: 13, width: 10, height: 0.5, maxWeightLb: 1 },
  small: { length: 8, width: 6, height: 4, maxWeightLb: 5 },
  medium: { length: 12, width: 9, height: 4, maxWeightLb: 15 },
  kit_large: { length: 14, width: 12, height: 6, maxWeightLb: 30 },
}

/** Box order, smallest first — also serves as the class size ranking. */
const BOX_ORDER: ShippableClass[] = ["tiny", "small", "medium", "kit_large"]

/** Fallback per-unit weight when an item has no `weight_lb` recorded. */
const DEFAULT_WEIGHT_LB: Record<ShippableClass, number> = {
  tiny: 0.2,
  small: 0.8,
  medium: 2,
  kit_large: 12,
}

function toParcel(box: BoxSpec, weightLb: number): ShippoParcel {
  return {
    length: String(box.length),
    width: String(box.width),
    height: String(box.height),
    weight: weightLb.toFixed(3),
    distance_unit: "in",
    mass_unit: "lb",
  }
}

/**
 * Chooses shipping parcels for a cart. Excludes `box_set` items (separate
 * flow), then groups the rest into the smallest box that fits both the
 * largest item's size and the combined weight. When the total weight exceeds
 * a single box's capacity, it splits into multiple kit_large parcels.
 */
export function buildParcels(items: ParcelItem[]): ShippoParcel[] {
  const shippableItems = items.filter((item) => item.packageClass !== "box_set")
  if (shippableItems.length === 0) return []

  let combinedWeightLb = 0
  let requiredSizeRank = 0

  for (const item of shippableItems) {
    const shippableClass = item.packageClass as ShippableClass
    const perUnitWeightLb = item.weightLb ?? DEFAULT_WEIGHT_LB[shippableClass]
    combinedWeightLb += perUnitWeightLb * item.quantity
    requiredSizeRank = Math.max(
      requiredSizeRank,
      BOX_ORDER.indexOf(shippableClass),
    )
  }

  // Smallest box at least as large as the biggest item that can also carry
  // the combined weight.
  for (let rank = requiredSizeRank; rank < BOX_ORDER.length; rank++) {
    const box = BOX_BY_CLASS[BOX_ORDER[rank]]
    if (box.maxWeightLb >= combinedWeightLb) {
      return [toParcel(box, combinedWeightLb)]
    }
  }

  // Combined weight exceeds the largest box — split into equal kit_large parcels.
  const largestBox = BOX_BY_CLASS.kit_large
  const parcelCount = Math.ceil(combinedWeightLb / largestBox.maxWeightLb)
  const weightPerParcelLb = combinedWeightLb / parcelCount
  return Array.from({ length: parcelCount }, () =>
    toParcel(largestBox, weightPerParcelLb),
  )
}
