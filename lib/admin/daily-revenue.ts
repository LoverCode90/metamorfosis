export interface DailyRevenue {
  /** Short weekday label, e.g. "Mon". */
  label: string
  revenueCents: number
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Buckets order rows into the last 7 calendar days (oldest first, ending
 * today), summing revenue per day. Pure — safe to unit test.
 */
export function buildDailyRevenue(
  rows: { created_at: string; total_cents: number | null }[],
  now: Date = new Date(),
): DailyRevenue[] {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const buckets: DailyRevenue[] = []
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const day = new Date(startOfToday.getTime() - daysAgo * DAY_MS)
    buckets.push({ label: WEEKDAYS[day.getDay()], revenueCents: 0 })
  }

  for (const row of rows) {
    const created = new Date(row.created_at)
    created.setHours(0, 0, 0, 0)
    const diffDays = Math.round(
      (startOfToday.getTime() - created.getTime()) / DAY_MS,
    )
    if (diffDays >= 0 && diffDays <= 6) {
      buckets[6 - diffDays].revenueCents += row.total_cents ?? 0
    }
  }

  return buckets
}
