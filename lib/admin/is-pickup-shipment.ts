/** True when the order is fulfilled via in-store pickup. */
export function isPickupShipment(
  shippingMethod?: string | null,
  carrier?: string | null,
): boolean {
  const method = shippingMethod?.toLowerCase() ?? ""
  const carrierName = carrier?.toLowerCase() ?? ""
  return method.includes("pickup") || carrierName.includes("pickup")
}
