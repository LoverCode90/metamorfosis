/**
 * Human-readable variation label for cart and wishlist lines.
 * Prefers shade/size over generic variation names; never returns categories.
 */
export function catalogVariationLabel(
  variation:
    | {
        shadeNumber?: string | null
        sizeLabel?: string | null
        nameEn?: string | null
      }
    | null
    | undefined,
): string {
  if (!variation) return ""

  const shade = variation.shadeNumber?.trim()
  if (shade) return shade

  const size = variation.sizeLabel?.trim()
  if (size) return size

  const name = variation.nameEn?.trim()
  if (name && name !== "Regular") return name

  return ""
}

/** True when subtitle text is a category breadcrumb, not a variation label. */
export function isCategoryHierarchyLabel(value: string): boolean {
  return value.includes(" > ")
}

/** Safe variant line for cart/wishlist cards — hides category paths. */
export function productVariantSubtitle(
  variant: string | undefined | null,
): string {
  const trimmed = variant?.trim() ?? ""
  if (!trimmed || isCategoryHierarchyLabel(trimmed)) return ""
  return trimmed
}
