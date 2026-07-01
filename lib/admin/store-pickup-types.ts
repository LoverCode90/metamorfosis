import type { AdminOrderItemSummary } from "@/lib/admin/order-list"

export type StorePickupTab = "pending" | "history"

export interface StorePickupOrder {
  id: string
  square_order_id: string
  status: string
  total_cents: number
  created_at: string
  updated_at: string
  pickup_deadline_at: string | null
  picked_up_at: string | null
  guest_email: string | null
  shipping_address: {
    fullName?: string
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
  } | null
  profiles: {
    first_name: string | null
    last_name: string | null
    full_name: string | null
  } | null
  order_items: AdminOrderItemSummary[]
}

export type StorePickupCancelSource =
  | "deadline_expired"
  | "admin_manual"
  | "unknown"

export interface StorePickupHistoryOrder extends StorePickupOrder {
  cancelSource: StorePickupCancelSource | null
}
