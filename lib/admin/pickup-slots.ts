import { pacificLocalToIsoUtc } from "@/lib/admin/pacific-datetime"

export type CarrierPickupSlotKey = "evening" | "daytime"

export interface CarrierPickupSlotDefinition {
  slotKey: CarrierPickupSlotKey
  label: string
  description: string
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

export const CARRIER_PICKUP_SLOTS: Record<
  CarrierPickupSlotKey,
  CarrierPickupSlotDefinition
> = {
  evening: {
    slotKey: "evening",
    label: "Evening pickup",
    description: "4:30 PM – 7:30 PM · have packages ready from the day before",
    startHour: 16,
    startMinute: 30,
    endHour: 19,
    endMinute: 30,
  },
  daytime: {
    slotKey: "daytime",
    label: "Daytime pickup",
    description: "10:00 AM – 6:00 PM · best when you are at the store all day",
    startHour: 10,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
  },
}

export interface CarrierPickupWindow {
  slotKey: CarrierPickupSlotKey
  pickupDate: string
  requestedStartTime: string
  requestedEndTime: string
}

/** Builds Shippo pickup window timestamps for a slot on a given date. */
export function buildCarrierPickupWindow(
  pickupDate: string,
  slotKey: CarrierPickupSlotKey,
): CarrierPickupWindow {
  const slot = CARRIER_PICKUP_SLOTS[slotKey]
  return {
    slotKey,
    pickupDate,
    requestedStartTime: pacificLocalToIsoUtc(
      pickupDate,
      slot.startHour,
      slot.startMinute,
    ),
    requestedEndTime: pacificLocalToIsoUtc(
      pickupDate,
      slot.endHour,
      slot.endMinute,
    ),
  }
}
