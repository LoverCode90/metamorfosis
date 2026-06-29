/** In-store pickup location + hours, shared by checkout UI and emails. */
export const PICKUP_ADDRESS = "211 W B St, Ontario, CA 91762"

export interface PickupHoursLine {
  days: string
  hours: string
}

export const PICKUP_HOURS: readonly PickupHoursLine[] = [
  { days: "Mon–Wed", hours: "4:00 PM – 8:00 PM" },
  { days: "Thu–Fri", hours: "9:00 AM – 8:00 PM" },
  { days: "Saturday", hours: "9:00 AM – 5:00 PM" },
  { days: "Sunday", hours: "Closed" },
]

export const PICKUP_HOURS_NOTE = "Holiday hours may vary."

/** Flat text lines (e.g. for plain-text emails). */
export function pickupHoursText(): string[] {
  return PICKUP_HOURS.map((line) => `${line.days}: ${line.hours}`)
}
