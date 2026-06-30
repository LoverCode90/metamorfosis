/** Two-letter initials from a person's display name. */
export function displayInitialsFromName(displayName: string): string {
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean)
  if (nameParts.length === 0) return "?"
  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase()
  }
  return `${nameParts[0][0] ?? ""}${nameParts[1][0] ?? ""}`.toUpperCase()
}
