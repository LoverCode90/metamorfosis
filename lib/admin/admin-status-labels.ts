import { formatCaseStatus } from "@/lib/utils/format"

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Needs label",
  confirmed: "Label printed",
  processing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
  cancelled: "Canceled",
  refunded: "Refunded",
}

const CASE_STATUS_LABELS: Record<string, string> = {
  open: "Needs your review",
  pending_review: "Waiting on customer",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  closed: "Closed",
  fraud: "Fraud",
}

/** Plain-English label for an order status chip or badge. */
export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? formatCaseStatus(status)
}

/** Plain-English label for a case status chip or badge. */
export function caseStatusLabel(status: string): string {
  return CASE_STATUS_LABELS[status] ?? formatCaseStatus(status)
}
