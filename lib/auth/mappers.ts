import type {
  DbProfile,
  DbVerificationStatus,
  UserProfile,
  VerificationStatus,
} from "@/lib/types"

export function mapVerificationStatus(
  status: DbVerificationStatus,
): VerificationStatus {
  switch (status) {
    case "approved":
      return "verified"
    case "pending_review":
      return "pending"
    case "rejected":
      return "rejected"
    default:
      return "regular"
  }
}

/**
 * Derive {firstName, lastName} from a DB profile row.
 * Prefers the structured first_name/last_name columns; falls back to splitting
 * the legacy full_name string on the first space for rows pre-migration.
 */
export function splitName(
  row: Pick<DbProfile, "first_name" | "last_name" | "full_name">,
): {
  firstName: string
  lastName: string
} {
  if (row.first_name !== null && row.first_name !== undefined) {
    return { firstName: row.first_name, lastName: row.last_name ?? "" }
  }
  const full = (row.full_name ?? "").trim()
  const ix = full.indexOf(" ")
  if (ix === -1) return { firstName: full, lastName: "" }
  return { firstName: full.slice(0, ix), lastName: full.slice(ix + 1).trim() }
}

/** Build the two-character avatar initials from a name. "John Smith" → "JS". */
export function initialsFromName(firstName: string, lastName: string): string {
  const first = (firstName ?? "").trim()
  const last = (lastName ?? "").trim()
  if (first && last) return (first[0]! + last[0]!).toUpperCase()
  if (first) return first.slice(0, 2).toUpperCase()
  if (last) return last.slice(0, 2).toUpperCase()
  return "?"
}

export function mapDbProfile(row: DbProfile): UserProfile {
  const { firstName, lastName } = splitName(row)
  const name = [firstName, lastName].filter(Boolean).join(" ").trim()
  return {
    firstName,
    lastName,
    name,
    email: row.email,
    location: row.business_name ?? "",
    status: mapVerificationStatus(row.verification_status),
  }
}
