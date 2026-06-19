import "server-only"

import type { PackageClass } from "@/lib/square/attributes"
import {
  BOX_TEMPLATES,
  DEFAULT_WEIGHTS_LB,
  PACKAGE_CLASS_ORDER,
  type BoxTemplate,
} from "./boxes"

export interface PackInput {
  packageClass: PackageClass
  weightLb: number | null
  quantity: number
}

/** Matches shippo's ParcelCreateRequest shape (camelCase). */
export interface Parcel {
  length: string
  width: string
  height: string
  distanceUnit: "in"
  weight: string
  massUnit: "lb"
}

export interface PackResult {
  parcels: Parcel[]
  oversized: boolean // true if an item cannot fit in any single box
}

interface OpenBox {
  template: BoxTemplate
  itemCounts: Partial<Record<PackageClass, number>>
  totalWeightLb: number
}

/**
 * Greedy bin-packing algorithm.
 *
 * 1. Expand items by quantity.
 * 2. Sort by packageClass descending (largest first).
 * 3. For each item, find the smallest open box with a slot for this class.
 *    If none, open a new box. If no single box can hold the item, mark oversized.
 * 4. Build Shippo Parcel objects from the resulting boxes.
 */
export function packItems(inputs: PackInput[]): PackResult {
  // Flatten by quantity
  const flat: { cls: PackageClass; weightLb: number }[] = []
  for (const input of inputs) {
    const w =
      input.weightLb ??
      (() => {
        console.warn(
          `[packing] weight_lb missing for ${input.packageClass} — using default`,
        )
        return DEFAULT_WEIGHTS_LB[input.packageClass]
      })()
    for (let i = 0; i < input.quantity; i++) {
      flat.push({ cls: input.packageClass, weightLb: w })
    }
  }

  // Sort: largest class first
  flat.sort(
    (a, b) =>
      PACKAGE_CLASS_ORDER.indexOf(a.cls) - PACKAGE_CLASS_ORDER.indexOf(b.cls),
  )

  // Find all box templates that can hold at least one of this class
  function boxesForClass(cls: PackageClass): BoxTemplate[] {
    return Object.values(BOX_TEMPLATES).filter((t) => (t.fits[cls] ?? 0) > 0)
  }

  // Find the smallest open box (by volume) that has a slot for this class
  function findOpenBox(
    openBoxes: OpenBox[],
    cls: PackageClass,
  ): OpenBox | null {
    const candidates = openBoxes.filter(
      (b) =>
        (b.itemCounts[cls] ?? 0) < (b.template.fits[cls] ?? 0) &&
        b.totalWeightLb < b.template.maxWeightLb,
    )
    if (candidates.length === 0) return null
    // Pick smallest by volume
    return candidates.reduce((min, b) => {
      const vol = (t: BoxTemplate) => t.length * t.width * t.height
      return vol(b.template) < vol(min.template) ? b : min
    })
  }

  const openBoxes: OpenBox[] = []
  let oversized = false

  for (const item of flat) {
    const existing = findOpenBox(openBoxes, item.cls)
    if (existing) {
      existing.itemCounts[item.cls] = (existing.itemCounts[item.cls] ?? 0) + 1
      existing.totalWeightLb += item.weightLb
      continue
    }

    // Open a new box — smallest that fits this class
    const eligible = boxesForClass(item.cls)
    if (eligible.length === 0) {
      console.warn(
        `[packing] No box fits class "${item.cls}" — flagged oversized`,
      )
      oversized = true
      continue
    }

    // Smallest that can hold at least one and stays under weight limit
    const newTemplate =
      eligible.find((t) => item.weightLb + t.tareLb <= t.maxWeightLb) ??
      eligible[eligible.length - 1]

    const box: OpenBox = {
      template: newTemplate,
      itemCounts: { [item.cls]: 1 } as Partial<Record<PackageClass, number>>,
      totalWeightLb: item.weightLb + newTemplate.tareLb,
    }
    openBoxes.push(box)
  }

  const parcels: Parcel[] = openBoxes.map((b) => ({
    length: String(b.template.length),
    width: String(b.template.width),
    height: String(b.template.height),
    distanceUnit: "in",
    weight: b.totalWeightLb.toFixed(3),
    massUnit: "lb",
  }))

  return { parcels, oversized }
}
