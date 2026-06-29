import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react"
import type React from "react"

export type StatusBadgeVariant =
  | "warning"
  | "violet"
  | "secondary"
  | "success"
  | "sky"
  | "destructive"

export interface StatusEntry {
  label: string
  badgeVariant: StatusBadgeVariant
  icon: React.ElementType
}

export const ORDER_STATUS_CONFIG: Record<string, StatusEntry> = {
  pending: { label: "Pending", badgeVariant: "warning", icon: Clock },
  confirmed: { label: "Confirmed", badgeVariant: "secondary", icon: Package },
  processing: { label: "Processing", badgeVariant: "secondary", icon: Package },
  shipped: { label: "Shipped", badgeVariant: "sky", icon: Truck },
  delivered: { label: "Delivered", badgeVariant: "success", icon: CheckCircle },
  // DB enum uses single-L "canceled"; keep "cancelled" too for safety.
  canceled: { label: "Canceled", badgeVariant: "destructive", icon: XCircle },
  cancelled: { label: "Canceled", badgeVariant: "destructive", icon: XCircle },
  refunded: { label: "Refunded", badgeVariant: "destructive", icon: XCircle },
}

export const CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000
export const RETURN_WINDOW_MS = 14 * 24 * 60 * 60 * 1000
