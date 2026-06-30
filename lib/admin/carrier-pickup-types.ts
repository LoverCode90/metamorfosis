import type { CarrierPickupSlotKey } from "@/lib/admin/pickup-slots"

export interface EligiblePickupOrder {
  id: string
  squareOrderId: string
  carrier: string
  pickupCarrier: "usps" | "dhl_express"
  createdAt: string
}

export interface CarrierPickupRecord {
  id: string
  slotKey: CarrierPickupSlotKey
  pickupDate: string
  requestedStartTime: string
  requestedEndTime: string
  confirmedStartTime: string | null
  confirmedEndTime: string | null
  status: string
  confirmationCode: string | null
  carrierInstructions: string | null
  carrierAccount: string | null
  orderCount: number
  createdAt: string
}

export interface ScheduledPickupResult {
  pickupCarrier: "usps" | "dhl_express"
  carrierLabel: string
  status: string
  confirmationCode: string | null
  confirmedStartTime: string | null
  confirmedEndTime: string | null
  orderCount: number
  shippoPickupId: string | null
  messages: string[]
}

export interface SchedulePickupsResponse {
  success: true
  pickupDate: string
  slotKey: CarrierPickupSlotKey
  results: ScheduledPickupResult[]
}

export interface PickupScheduleShipFrom {
  name: string
  company: string
  street1: string
  city: string
  state: string
  zip: string
  phone: string
}

export interface PickupScheduleData {
  eligibleOrders: EligiblePickupOrder[]
  eligibleCounts: { usps: number; dhl_express: number }
  eligibleTotal: number
  history: CarrierPickupRecord[]
  shipFrom: PickupScheduleShipFrom
}
