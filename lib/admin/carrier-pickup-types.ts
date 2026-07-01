import type { CarrierPickupSlotKey } from "@/lib/admin/pickup-slots"
import type { PickupCarrierKind } from "@/lib/admin/pickup-carrier"

export type PickupOrderStatus = "unscheduled" | "scheduled" | "completed"
export type PickupPageTab = "ready" | "scheduled" | "history"

export interface PickupOrderRow {
  id: string
  recipientName: string
  labelPurchasedAt: string | null
  pickupCarrier: PickupCarrierKind
  carrierDisplay: string
  serviceName: string | null
  trackingNumber: string | null
  labelCostCents: number | null
  pickupStatus: PickupOrderStatus
  pickupWindow: PickupWindowInfo | null
}

export interface PickupWindowInfo {
  pickupDate: string
  slotKey: CarrierPickupSlotKey
  slotLabel: string
  confirmationCode: string | null
}

export interface PickupTabResponse {
  tab: PickupPageTab
  rows: PickupOrderRow[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

export interface ScheduledPickupMeta {
  pickupDate: string
  slotKey: CarrierPickupSlotKey
  slotLabel: string
  confirmationCode: string | null
  confirmedStartTime: string | null
  confirmedEndTime: string | null
}

export interface PickupScheduledTabResponse {
  tab: "scheduled"
  usps: PickupOrderRow[]
  dhlExpress: PickupOrderRow[]
  pickupMeta: ScheduledPickupMeta | null
}

export interface ScheduledPickupResult {
  pickupCarrier: PickupCarrierKind
  carrierLabel: string
  status: string
  confirmationCode: string | null
  confirmedStartTime: string | null
  confirmedEndTime: string | null
  orderCount: number
  shippoPickupId: string | null
  carrierPickupId: string
  messages: string[]
}

export interface SchedulePickupsResponse {
  success: true
  pickupDate: string
  slotKey: CarrierPickupSlotKey
  results: ScheduledPickupResult[]
}
