import { AdminSurfaceCard } from "@/components/admin/ui/admin-surface-card"
import { PickupOrdersTable } from "@/components/admin/shipping/pickup-orders-table"
import type { PickupOrderRow } from "@/lib/admin/carrier-pickup-types"
import { pickupCarrierLabel } from "@/lib/admin/pickup-carrier"
import type { PickupCarrierKind } from "@/lib/admin/pickup-carrier"

interface PickupScheduledCarrierCardProps {
  carrier: PickupCarrierKind
  rows: PickupOrderRow[]
  confirmationCode?: string | null
}

export function PickupScheduledCarrierCard({
  carrier,
  rows,
  confirmationCode,
}: PickupScheduledCarrierCardProps) {
  return (
    <AdminSurfaceCard
      title={`${pickupCarrierLabel(carrier)} pickups`}
      description={
        confirmationCode
          ? `Confirmation code: ${confirmationCode}`
          : "Awaiting carrier confirmation"
      }
    >
      <PickupOrdersTable
        rows={rows}
        emptyMessage={`No ${pickupCarrierLabel(carrier)} packages scheduled.`}
      />
    </AdminSurfaceCard>
  )
}
