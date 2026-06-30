import { Badge } from "@/components/ui/badge"
import { AdminShipAction } from "@/components/admin/orders/admin-ship-action"
import type { PackingSlipData } from "@/components/admin/orders/packing-slip-print"
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
  /** When true, renders without outer card shell (nested in parent card). */
  embedded?: boolean
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
  embedded = false,
}: OrderFulfillmentCardProps) {
  const isPickup =
    shippingMethod?.toLowerCase().includes("pickup") ||
    carrier?.toLowerCase().includes("pickup")
  const statusBadge = orderStatusBadge(status)

  return (
    <div
      className={cn(
        embedded
          ? "space-y-4 text-sm"
          : cn(ADMIN_SERVER_CARD_CLASS, "space-y-4 p-6 text-sm"),
      )}
    >
      <h2 className="text-foreground text-base font-semibold">Fulfillment</h2>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          Status
        </p>
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        <p className="text-muted-foreground text-xs">
          Updated automatically via Shippo when the label is printed and when
          the carrier scans the package.
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          Tracking
        </p>
        {trackingNumber ? (
          <div className="space-y-3">
            <a
              href={trackingUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground block font-medium break-all hover:underline"
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
