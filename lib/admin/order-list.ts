export interface AdminOrderItemSummary {
  quantity: number
  product_variations: { name_en: string } | null
}

export interface AdminOrderListItem {
  id: string
  square_order_id: string
  status: string
  total_cents: number
  created_at: string
  guest_email: string | null
  tracking_number: string | null
  shipping_address: {
    first_name?: string
    last_name?: string
    email?: string
  } | null
  order_items: AdminOrderItemSummary[]
}

/** How many orders are listed per page. */
export const ORDERS_PER_PAGE = 20

/** Short, human order label (MF- numbers pass through, UUIDs are truncated). */
export function orderLabel(squareOrderId: string): string {
  return squareOrderId.startsWith("MF-")
    ? squareOrderId
    : `#${squareOrderId.slice(0, 8).toUpperCase()}`
}

/** Derives a display name from the order's stored shipping address. */
export function customerName(order: AdminOrderListItem): string {
  const addr = order.shipping_address
  if (addr?.first_name || addr?.last_name) {
    return `${addr.first_name ?? ""} ${addr.last_name ?? ""}`.trim()
  }
  return "Unknown"
}

/** Best-known email for the order (address email, then guest email). */
export function customerEmail(order: AdminOrderListItem): string {
  return order.shipping_address?.email ?? order.guest_email ?? "—"
}

/** One-line items summary, e.g. "Shampoo ×2 +1 more". */
export function itemsSummary(items: AdminOrderItemSummary[]): string {
  if (items.length === 0) return "—"
  const [first, ...rest] = items
  const name = first.product_variations?.name_en ?? "Item"
  const head = `${name} ×${first.quantity}`
  return rest.length > 0 ? `${head} +${rest.length} more` : head
}
