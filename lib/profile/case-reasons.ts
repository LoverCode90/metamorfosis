import type { DbOrder } from "@/lib/orders/types"

export interface CaseReason {
  value: string
  label: string
}

// Non-returnable (chemical) products can only be reported for store-fault
// reasons; returnable products offer the full set.
export const CHEMICAL_REASONS: readonly CaseReason[] = [
  { value: "damaged", label: "Arrived damaged" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "defective", label: "Item is defective" },
]

export const ALL_REASONS: readonly CaseReason[] = [
  ...CHEMICAL_REASONS,
  { value: "not_as_described", label: "Not as described" },
  { value: "no_longer_needed", label: "No longer needed" },
  { value: "ordered_by_mistake", label: "Ordered by mistake" },
  { value: "other", label: "Other" },
]

/**
 * Returns the reasons selectable for an order item — the limited chemical set
 * for non-returnable items, otherwise the full set.
 */
export function reasonsForItem(
  item: DbOrder["order_items"][number] | undefined,
): readonly CaseReason[] {
  const isChemicalItem =
    item?.product_variations?.product_translations?.is_returnable === false
  return isChemicalItem ? CHEMICAL_REASONS : ALL_REASONS
}
