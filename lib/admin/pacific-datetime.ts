const STORE_TIME_ZONE = "America/Los_Angeles"

function padTimeUnit(value: number): string {
  return String(value).padStart(2, "0")
}

/**
 * Converts a local Ontario, CA date + time into a UTC Date.
 * Uses the store timezone (America/Los_Angeles).
 */
export function pacificLocalToUtcDate(
  dateYmd: string,
  hour: number,
  minute: number,
): Date {
  const localDateTime = `${dateYmd}T${padTimeUnit(hour)}:${padTimeUnit(minute)}:00`
  const localAsUtc = new Date(localDateTime)
  const zonedView = new Date(
    localAsUtc.toLocaleString("en-US", { timeZone: STORE_TIME_ZONE }),
  )
  const offsetMilliseconds = localAsUtc.getTime() - zonedView.getTime()
  return new Date(localAsUtc.getTime() - offsetMilliseconds)
}

/** ISO-8601 UTC string for Shippo pickup windows. */
export function pacificLocalToIsoUtc(
  dateYmd: string,
  hour: number,
  minute: number,
): string {
  return pacificLocalToUtcDate(dateYmd, hour, minute).toISOString()
}

/** Today's date in America/Los_Angeles as YYYY-MM-DD. */
export function pacificTodayYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
  }).format(new Date())
}

/** Formats an ISO timestamp for display in Pacific time. */
export function formatPacificDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}
