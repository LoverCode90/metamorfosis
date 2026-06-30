import { AdminShipAction } from "@/components/admin/orders/admin-ship-action"
import { AdminStatusSelect } from "@/components/admin/orders/admin-status-select"
import type { PackingSlipData } from "@/components/admin/orders/packing-slip-print"
import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
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

/** Order status updater plus tracking display / label generation. */
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

  return (
    <div className={cn(ADMIN_SERVER_CARD_CLASS, "space-y-4 p-6 text-sm")}>
      <h2 className="text-foreground text-base font-semibold">Fulfillment</h2>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          Status
        </p>
        <AdminStatusSelect orderId={orderId} current={status} />
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
              className="text-foreground block font-medium hover:underline"
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
