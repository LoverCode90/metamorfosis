import { format, parseISO } from "date-fns"
import { enUS } from "date-fns/locale"

/**
 * Formats an integer cent amount as a USD currency string.
 * e.g. formatUSD(7000) → "$70.00"
 */
export function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Alias for formatUSD — prefer this name when the context is clearly monetary.
 */
export const formatCents = formatUSD

/**
 * Formats an ISO date string using date-fns.
 * Defaults to "MMM d, yyyy" (e.g. "Jun 18, 2026").
 */
export function formatDate(iso: string, fmt = "MMM d, yyyy"): string {
  return format(parseISO(iso), fmt, { locale: enUS })
}

/**
 * Humanizes a snake_case case status or reason for display.
 * e.g. "pending_review" → "Pending Review".
 */
export function formatCaseStatus(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Estimated delivery window as a human range (e.g. "Jun 26–Jul 2"),
 * computed as 3–7 business days from today (weekends skipped).
 */
export function estimatedDeliveryRange(): string {
  const addBusinessDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    let added = 0
    while (added < days) {
      result.setDate(result.getDate() + 1)
      const dayOfWeek = result.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) added++
    }
    return result
  }
  const today = new Date()
  const fmt = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return `${fmt(addBusinessDays(today, 3))}–${fmt(addBusinessDays(today, 7))}`
}
