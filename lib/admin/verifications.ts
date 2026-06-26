export interface VerificationRow {
  id: string
  full_name: string
  email: string
  role: string
  verification_status: string
  rejection_reason: string | null
  license_number: string | null
  document_url: string | null
  expiration_date: string | null
  business_name: string | null
  created_at: string
  updated_at: string
}

export type StatusFilter = "pending_review" | "approved" | "rejected" | "all"

/** Status filter tabs, in display order. */
export const FILTER_TABS: { label: string; value: StatusFilter }[] = [
  { label: "Pending", value: "pending_review" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
]

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

/** Badge variant matching shadcn {@link Badge} for a verification status. */
export type StatusBadgeVariant =
  | "warning"
  | "success"
  | "destructive"
  | "secondary"

/**
 * Maps a verification status to its {@link Badge} variant.
 * @param status - Raw `verification_status` value.
 */
export function statusBadgeVariant(status: string): StatusBadgeVariant {
  switch (status) {
    case "pending_review":
      return "warning"
    case "approved":
      return "success"
    case "rejected":
      return "destructive"
    default:
      return "secondary"
  }
}

/** Human-readable label for a verification status. */
export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}
