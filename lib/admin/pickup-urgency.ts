import { differenceInCalendarDays, startOfDay } from "date-fns"

export type PickupUrgency = "overdue" | "today" | "soon"

/** Highlights pickups due today, tomorrow, or past the deadline. */
export function pickupUrgency(
  deadline: Date,
  now = new Date(),
): PickupUrgency | null {
  const today = startOfDay(now)
  const deadlineDay = startOfDay(deadline)
  const daysLeft = differenceInCalendarDays(deadlineDay, today)

  if (daysLeft < 0) return "overdue"
  if (daysLeft === 0) return "today"
  if (daysLeft === 1) return "soon"
  return null
}

export function pickupUrgencyLabel(urgency: PickupUrgency): string {
  switch (urgency) {
    case "overdue":
      return "Past pickup deadline — will auto-cancel and refund"
    case "today":
      return "Must be picked up today"
    case "soon":
      return "Must be picked up by tomorrow"
  }
}
