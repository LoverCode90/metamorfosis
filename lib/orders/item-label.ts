/**
 * Builds a human label for an order line: "{product} — {variation}".
 *
 * Square's default variation is named "Regular"; when the variation adds no
 * information (missing, "Regular", or identical to the product) only the
 * product name is shown. Falls back to the variation name, then a placeholder.
 */
export function itemLabel(
  productName: string | null | undefined,
  variationName: string | null | undefined,
): string {
  const product = productName?.trim()
  const variation = variationName?.trim()

  if (!product) return variation || "Item"

  const variationAddsInfo =
    variation && variation !== "Regular" && variation !== product

  return variationAddsInfo ? `${product} — ${variation}` : product
}
