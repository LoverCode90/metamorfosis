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
