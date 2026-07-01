import { Badge } from "@/components/ui/badge"
import { AdminShipAction } from "@/components/admin/orders/admin-ship-action"
import type { PackingSlipData } from "@/lib/admin/packing-slip-types"
import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
import { orderStatusBadge } from "@/lib/admin/status-badge"
import { cn } from "@/lib/utils"

interface OrderFulfillmentCardProps {
  orderId: string
  status: string
  trackingNumber: string | null
  trackingUrl: string | null
  carrier: string | null
  shippingMethod?: string | null
  shippoTransactionId?: string | null
  packingSlip?: PackingSlipData | null
}

/** Read-only status plus tracking display and label generation. */
export function OrderFulfillmentCard({
  orderId,
  status,
  trackingNumber,
  trackingUrl,
  carrier,
  shippingMethod,
  shippoTransactionId,
  packingSlip,
}: OrderFulfillmentCardProps) {
  const isPickup =
    shippingMethod?.toLowerCase().includes("pickup") ||
    carrier?.toLowerCase().includes("pickup")
  const statusBadge = orderStatusBadge(status)
  const needsLabel = !trackingNumber && status === "pending"

  return (
    <div className={cn(ADMIN_SERVER_CARD_CLASS, "space-y-5 p-6")}>
      <h2 className="text-foreground text-lg font-semibold">Shipping</h2>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">
          Current step
        </p>
        <Badge variant={statusBadge.variant} className="text-sm">
          {statusBadge.label}
        </Badge>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {needsLabel
            ? "Print a shipping label, attach it to the box, then schedule carrier pickup from the menu."
            : "After the label is printed, schedule carrier pickup so USPS or DHL can collect the package."}
        </p>
      </div>
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          {trackingNumber ? "Tracking number" : "Shipping label"}
        </p>
        {trackingNumber ? (
          <div className="space-y-3">
            <a
              href={trackingUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground block text-base font-medium break-all hover:underline"
            >
              {trackingNumber}
              {carrier ? ` · ${carrier}` : ""}
            </a>
            {!isPickup && shippoTransactionId && (
              <AdminShipAction
                orderId={orderId}
                shippingMethod={shippingMethod}
                carrier={carrier}
                trackingNumber={trackingNumber}
                shippoTransactionId={shippoTransactionId}
              />
            )}
          </div>
        ) : (
          <AdminShipAction
            orderId={orderId}
            shippingMethod={shippingMethod}
            carrier={carrier}
            packingSlip={packingSlip}
          />
        )}
      </div>
    </div>
  )
}
