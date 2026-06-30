/** Compact relative timestamp for admin notification lists. */
export function formatAdminRelativeTime(isoDate: string): string {
  const diffMilliseconds = Date.now() - new Date(isoDate).getTime()
  const diffMinutes = Math.floor(diffMilliseconds / 60_000)
  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return new Date(isoDate).toLocaleDateString()
}
