import {
  caseStatusLabel,
  orderStatusLabel,
} from "@/lib/admin/admin-status-labels"

/** Badge variants used for status indicators across the admin panel. */
export type StatusBadgeVariant =
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "sky"

export interface StatusBadge {
  variant: StatusBadgeVariant
  label: string
}

const ORDER_STATUS_VARIANTS: Record<string, StatusBadgeVariant> = {
  pending: "warning",
  confirmed: "secondary",
  processing: "secondary",
  shipped: "sky",
  delivered: "success",
  canceled: "destructive",
  cancelled: "destructive",
  refunded: "destructive",
}

const CASE_STATUS_VARIANTS: Record<string, StatusBadgeVariant> = {
  open: "warning",
  pending_review: "secondary",
  under_review: "secondary",
  approved: "success",
  rejected: "destructive",
  closed: "secondary",
  fraud: "destructive",
}

/** Maps a DB order_status to a Badge variant + human label. */
export function orderStatusBadge(status: string): StatusBadge {
  return {
    variant: ORDER_STATUS_VARIANTS[status] ?? "secondary",
    label: orderStatusLabel(status),
  }
}

/** Maps a DB case_status to a Badge variant + human label. */
export function caseStatusBadge(status: string): StatusBadge {
  return {
    variant: CASE_STATUS_VARIANTS[status] ?? "secondary",
    label: caseStatusLabel(status),
  }
}
