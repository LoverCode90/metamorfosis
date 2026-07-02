export interface DbOrderItem {
  id: string
  variation_id: string
  quantity: number
  unit_price_cents: number
  discount_cents: number
  product_variations: {
    name_en: string
    image_url: string | null
    product_translations: {
      square_product_id: string
      name_en: string
      is_returnable: boolean
      image_url?: string | null
    } | null
  } | null
}

export interface DbOrder {
  id: string
  square_order_id: string
  status: string
  shipping_method: string
  subtotal_cents: number
  discount_cents: number
  shipping_cents: number
  tax_cents: number
  total_cents: number
  shipping_address: {
    fullName: string
    email: string
    phone: string
    streetLine1: string
    streetLine2: string
    city: string
    state: string
    zip: string
    country: string
  }
  tracking_number: string | null
  carrier: string | null
  tracking_url: string | null
  estimated_delivery_date: string | null
  delivered_at: string | null
  pickup_deadline_at: string | null
  picked_up_at: string | null
  created_at: string
  updated_at: string
  order_items: DbOrderItem[]
  cases?: { id: string; status: string }[]
}

/**
 * Maps a DB order_status to a 0-based stage index used by the tracking UI.
 * Stages: 0=placed, 1=processing, 2=shipped, 3=delivered
 */
export function orderStatusToStageIndex(status: string): number {
  switch (status) {
    case "pending":
    case "confirmed":
      return 1 // processing
    case "shipped":
      return 2
    case "delivered":
      return 3
    case "cancelled":
    case "refunded":
      return 0
    default:
      return 0
  }
}

/**
 * Maps pickup order status to tracking stage index.
 * Stages: 0=placed, 1=processing, 2=ready, 3=picked up
 */
export function pickupOrderStatusToStageIndex(status: string): number {
  switch (status) {
    case "pending":
      return 0
    case "processing":
      return 1
    case "confirmed":
      return 2
    case "delivered":
      return 3
    case "cancelled":
    case "canceled":
    case "refunded":
      return 0
    default:
      return 1
  }
}
