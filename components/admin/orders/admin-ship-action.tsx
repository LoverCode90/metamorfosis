"use client"

import { AdminShipLabelControls } from "@/components/admin/orders/admin-ship-label-controls"
import { PackingSlipPrint } from "@/components/admin/orders/packing-slip-print"
import type { PackingSlipData } from "@/lib/admin/packing-slip-types"
import { isPickupShipment } from "@/lib/admin/is-pickup-shipment"
import { useAdminShipLabel } from "@/hooks/use-admin-ship-label"

interface AdminShipActionProps {
  orderId: string
  shippingMethod?: string | null
  carrier?: string | null
  trackingNumber?: string | null
  shippoTransactionId?: string | null
  packingSlip?: PackingSlipData | null
}

/** Generates a Shippo label or prints a pickup packing slip in-page. */
export function AdminShipAction({
  orderId,
  shippingMethod,
  carrier,
  trackingNumber,
  shippoTransactionId,
  packingSlip,
}: AdminShipActionProps) {
  const shipLabel = useAdminShipLabel({
    orderId,
    trackingNumber,
    carrier,
    shippoTransactionId,
  })

  const orderIsPickup = isPickupShipment(shippingMethod, carrier)
  if (orderIsPickup && packingSlip) {
    return <PackingSlipPrint slipData={packingSlip} />
  }

  return (
    <AdminShipLabelControls
      orderId={orderId}
      isLoading={shipLabel.isLoading}
      errorMessage={shipLabel.errorMessage}
      hasExistingLabel={shipLabel.hasExistingLabel}
      labelDialogOpen={shipLabel.labelDialogOpen}
      labelTrackingNumber={shipLabel.labelTrackingNumber}
      labelCarrier={shipLabel.labelCarrier}
      shippoTestMode={shipLabel.shippoTestMode}
      onGenerateLabel={shipLabel.generateLabel}
      onReprintLabel={shipLabel.reprintLabel}
      onLabelDialogOpenChange={shipLabel.setLabelDialogOpen}
    />
  )
}
