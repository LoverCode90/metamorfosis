import Link from "next/link"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminShipAction } from "@/components/admin/orders/admin-ship-action"
import { AdminStatusSelect } from "@/components/admin/orders/admin-status-select"

interface OrderFulfillmentCardProps {
  orderId: string
  status: string
  trackingNumber: string | null
  trackingUrl: string | null
  carrier: string | null
  shippingMethod?: string | null
}

/** Order status updater plus tracking display / label generation. */
export function OrderFulfillmentCard({
  orderId,
  status,
  trackingNumber,
  trackingUrl,
  carrier,
  shippingMethod,
}: OrderFulfillmentCardProps) {
  const isPickup = shippingMethod === "pickup"

  return (
    <div className="border-border bg-card space-y-4 rounded-2xl border p-6 text-sm">
      <h2 className="text-foreground text-base font-semibold">Fulfillment</h2>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          Status
        </p>
        <AdminStatusSelect orderId={orderId} current={status} />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          {isPickup ? "Packing Slip" : "Tracking"}
        </p>
        {isPickup ? (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            render={
              <Link
                href={`/admin/orders/${orderId}/packing-slip`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Packing Slip
          </Button>
        ) : trackingNumber ? (
          <a
            href={trackingUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium hover:underline"
          >
            {trackingNumber}
            {carrier ? ` · ${carrier}` : ""}
          </a>
        ) : (
          <AdminShipAction orderId={orderId} />
        )}
      </div>
    </div>
  )
}
