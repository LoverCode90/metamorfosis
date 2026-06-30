import { formatDistanceToNow } from "date-fns"

/** Short relative timestamp for admin lists (e.g. "3 hours ago"). */
export function formatAdminRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

/** @alias formatAdminRelativeTime */
export const formatRelativeTime = formatAdminRelativeTime
