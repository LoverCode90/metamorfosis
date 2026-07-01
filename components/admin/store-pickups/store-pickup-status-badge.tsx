import { Badge } from "@/components/ui/badge"
import type { StorePickupCancelSource } from "@/lib/admin/store-pickup-types"

interface StorePickupStatusBadgeProps {
  status: string
  cancelSource?: StorePickupCancelSource | null
}

export function StorePickupStatusBadge({
  status,
  cancelSource,
}: StorePickupStatusBadgeProps) {
  if (status === "delivered") {
    return <Badge variant="success">Picked up</Badge>
  }

  if (status === "canceled" || status === "cancelled") {
    if (cancelSource === "deadline_expired") {
      return (
        <Badge variant="destructive">Pickup window expired — refunded</Badge>
      )
    }
    if (cancelSource === "admin_manual") {
      return <Badge variant="destructive">Canceled & refunded</Badge>
    }
    return <Badge variant="destructive">Canceled</Badge>
  }

  if (status === "confirmed" || status === "processing") {
    return <Badge variant="secondary">Ready for pickup</Badge>
  }

  return <Badge variant="warning">Awaiting preparation</Badge>
}
