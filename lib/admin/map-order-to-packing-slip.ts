import type {
  PackingSlipAddress,
  PackingSlipData,
  PackingSlipItem,
} from "@/lib/admin/packing-slip-types"
import { isPickupShipment } from "@/lib/admin/is-pickup-shipment"

interface OrderItemRow {
  id: string
  quantity: number
  unit_price_cents: number
  product_variations: {
    name_en: string
    product_translations: { name_en: string } | null
  } | null
}

interface OrderRowForPackingSlip {
  id: string
  created_at: string
  shipping_method: string | null
  carrier: string | null
  shipping_address: PackingSlipAddress | Record<string, string> | null
  order_items: OrderItemRow[] | null
  subtotal_cents: number
  discount_cents: number
  surcharge_cents: number | null
  tax_cents: number
  shipping_cents: number
  total_cents: number
}

function mapOrderItemToSlipItem(orderItem: OrderItemRow): PackingSlipItem {
  return {
    id: orderItem.id,
    quantity: orderItem.quantity,
    unitPriceCents: orderItem.unit_price_cents,
    productName:
      orderItem.product_variations?.product_translations?.name_en ??
      "Unknown Product",
    variationName: orderItem.product_variations?.name_en ?? "",
  }
}

/** Maps a Supabase order row into printable packing slip data. */
export function mapOrderToPackingSlipData(
  order: OrderRowForPackingSlip,
): PackingSlipData {
  const shippingAddress = order.shipping_address as PackingSlipAddress | null

  return {
    orderId: order.id,
    createdAt: order.created_at,
    isPickup: isPickupShipment(order.shipping_method, order.carrier),
    address: shippingAddress,
    items: (order.order_items ?? []).map(mapOrderItemToSlipItem),
    subtotalCents: order.subtotal_cents,
    discountCents: order.discount_cents,
    surchargeCents: order.surcharge_cents ?? 0,
    taxCents: order.tax_cents,
    shippingCents: order.shipping_cents,
    totalCents: order.total_cents,
  }
}
