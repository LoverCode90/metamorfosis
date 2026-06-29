import type { DbOrder } from "@/lib/orders/types"

export interface CaseReason {
  value: string
  label: string
}

export interface ReasonRule {
  requirePhotos: boolean
  requireCondition: boolean
  storeOwed: boolean
}

/**
 * Per-reason return policy: whether photos and a condition disclosure are
 * required, and whether the store is at fault (drives full vs. partial refund).
 */
export const REASON_CONFIG = {
  damaged: { requirePhotos: true, requireCondition: false, storeOwed: true },
  wrong_item: { requirePhotos: true, requireCondition: false, storeOwed: true },
  defective: { requirePhotos: true, requireCondition: false, storeOwed: true },
  not_as_described: {
    requirePhotos: true,
    requireCondition: true,
    storeOwed: false,
  },
  no_longer_needed: {
    requirePhotos: true,
    requireCondition: true,
    storeOwed: false,
  },
  ordered_by_mistake: {
    requirePhotos: true,
    requireCondition: true,
    storeOwed: false,
  },
  other: { requirePhotos: true, requireCondition: true, storeOwed: false },
} as const satisfies Record<string, ReasonRule>

const DEFAULT_RULE: ReasonRule = {
  requirePhotos: true,
  requireCondition: true,
  storeOwed: false,
}

/** Returns the policy rule for a reason, falling back to the strictest rule. */
export function ruleForReason(reason: string): ReasonRule {
  return (REASON_CONFIG as Record<string, ReasonRule>)[reason] ?? DEFAULT_RULE
}

export interface ConditionOption {
  value: string
  label: string
}

/** Item-condition disclosure choices shown for customer-fault returns. */
export const CONDITION_OPTIONS: readonly ConditionOption[] = [
  { value: "unopened", label: "Unopened / sealed" },
  { value: "opened_unused", label: "Opened, never used" },
  { value: "used_good", label: "Used, good condition" },
  { value: "used_worn", label: "Used, showing wear" },
]

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

/** Human label for a case reason value (e.g. "damaged" → "Arrived damaged"). */
export function caseReasonLabel(value: string): string {
  const match = ALL_REASONS.find((reason) => reason.value === value)
  if (match) return match.label
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

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
