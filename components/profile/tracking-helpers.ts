export function fmtDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function fmtDollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}
