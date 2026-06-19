import "server-only"

import type { PackageClass } from "@/lib/square/attributes"

export interface BoxTemplate {
  name: string
  length: number // inches
  width: number // inches
  height: number // inches
  maxWeightLb: number
  tareLb: number
  /** Max items of each packageClass that fit in this box */
  fits: Partial<Record<PackageClass, number>>
}

/**
 * Box catalog — dimensions are approximate pending physical measurement.
 * Update only the length/width/height/maxWeightLb/tareLb values once real
 * boxes are measured. The packing algorithm logic does not change.
 */
export const BOX_TEMPLATES: Record<string, BoxTemplate> = {
  envelope: {
    name: "Envelope",
    length: 12,
    width: 9,
    height: 1,
    maxWeightLb: 1,
    tareLb: 0.1,
    fits: { tiny: 10 },
  },
  small: {
    name: "Small Box",
    length: 8,
    width: 6,
    height: 4,
    maxWeightLb: 10,
    tareLb: 0.3,
    fits: { tiny: 10, small: 3, medium: 1 },
  },
  medium: {
    name: "Medium Box",
    length: 12,
    width: 9,
    height: 6,
    maxWeightLb: 25,
    tareLb: 0.5,
    fits: { tiny: 20, small: 6, medium: 4, box_set: 2 },
  },
  large: {
    name: "Large Box",
    length: 18,
    width: 14,
    height: 12,
    maxWeightLb: 50,
    tareLb: 1.0,
    fits: { tiny: 50, small: 15, medium: 8, box_set: 4 },
  },
  kit_large: {
    name: "Kit Box",
    length: 24,
    width: 18,
    height: 14,
    maxWeightLb: 80,
    tareLb: 1.5,
    fits: { kit_large: 1 },
  },
}

/** Fallback weights when item.weight_lb is null */
export const DEFAULT_WEIGHTS_LB: Record<PackageClass, number> = {
  tiny: 0.2,
  small: 0.8,
  medium: 2.0,
  box_set: 4.0,
  kit_large: 12.0,
}

/**
 * Class order for bin-packing: largest items packed first.
 */
export const PACKAGE_CLASS_ORDER: PackageClass[] = [
  "kit_large",
  "box_set",
  "medium",
  "small",
  "tiny",
]
