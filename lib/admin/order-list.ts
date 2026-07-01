import { itemLabel } from "@/lib/orders/item-label"

export interface AdminOrderItemSummary {
  quantity: number
  product_variations: {
    name_en: string
    product_translations: { name_en: string } | null
  } | null
}

export interface AdminOrderCustomerFields {
  guest_email: string | null
  shipping_address: {
    first_name?: string
    last_name?: string
    fullName?: string
    email?: string
  } | null
  profiles: {
    first_name: string | null
    last_name: string | null
    full_name: string | null
  } | null
}

export interface AdminOrderListItem extends AdminOrderCustomerFields {
  id: string
  square_order_id: string
  status: string
  total_cents: number
  created_at: string
  tracking_number: string | null
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

/**
 * Best-known customer name: profile name first, then the shipping address,
 * then the guest email, then "Guest".
 */
export function customerName(order: AdminOrderCustomerFields): string {
  const profile = order.profiles
  if (profile?.first_name || profile?.last_name) {
    return `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
  }
  if (profile?.full_name) return profile.full_name

  const addr = order.shipping_address
  if (addr?.first_name || addr?.last_name) {
    return `${addr.first_name ?? ""} ${addr.last_name ?? ""}`.trim()
  }
  if (addr?.fullName) return addr.fullName

  return order.guest_email ?? "Guest"
}

/** Best-known email for the order (address email, then guest email). */
export function customerEmail(order: AdminOrderCustomerFields): string {
  return order.shipping_address?.email ?? order.guest_email ?? "—"
}

/** One-line items summary, e.g. "Earthia Color — Arctic and 1 more". */
export function itemsSummary(items: AdminOrderItemSummary[]): string {
  if (items.length === 0) return "—"
  const [first, ...rest] = items
  const name = itemLabel(
    first.product_variations?.product_translations?.name_en,
    first.product_variations?.name_en,
  )
  return rest.length > 0 ? `${name} and ${rest.length} more` : name
}
