import { Package, Store } from "lucide-react"

import type { PackingSlipData } from "@/lib/admin/packing-slip-types"
import { formatUSD } from "@/lib/utils/format"

interface PackingSlipLayoutProps {
  slipData: PackingSlipData
}

/** Printable packing slip body shared by dialog preview and print route. */
export function PackingSlipLayout({ slipData }: PackingSlipLayoutProps) {
  const shippingAddress = slipData.address
  const lineItems = slipData.items

  return (
    <div className="packing-slip-print bg-white p-4 font-sans text-black">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center border-b border-black pb-4 text-center">
          <Store className="mb-2 h-8 w-8" strokeWidth={2} />
          <h1 className="text-xl font-bold tracking-tight uppercase">
            Metamorfosis
          </h1>
          <p className="text-sm font-medium">
            Order #{slipData.orderId.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(slipData.createdAt).toLocaleString()}
          </p>
        </div>

        {slipData.isPickup && (
          <div className="rounded-md border-4 border-black py-2 text-center">
            <span className="text-xl font-black tracking-widest uppercase">
              Store Pickup
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Customer Info
          </h2>
          <p className="text-lg font-bold">
            {shippingAddress?.fullName || "Guest"}
          </p>
          {shippingAddress?.phone && (
            <p className="text-sm font-medium">{shippingAddress.phone}</p>
          )}
          {shippingAddress?.email && (
            <p className="text-sm font-medium">{shippingAddress.email}</p>
          )}
          {shippingAddress?.streetLine1 && (
            <div className="mt-1 text-sm font-medium">
              <p>{shippingAddress.streetLine1}</p>
              {shippingAddress.streetLine2 && (
                <p>{shippingAddress.streetLine2}</p>
              )}
              <p>
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.zip}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
            <Package className="h-4 w-4" strokeWidth={2} />
            Items ({lineItems.length})
          </h2>
          <div className="flex flex-col gap-3">
            {lineItems.map((lineItem) => (
              <div
                key={lineItem.id}
                className="flex items-start justify-between gap-4 border-t border-dashed border-gray-300 pt-3"
              >
                <div className="flex flex-col">
                  <span className="text-base leading-tight font-bold">
                    {lineItem.productName}
                  </span>
                  <span className="mt-0.5 text-sm font-medium text-gray-600">
                    {lineItem.variationName}
                  </span>
                  <span className="mt-1 text-xs font-medium">
                    {formatUSD(lineItem.unitPriceCents)} x {lineItem.quantity}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex shrink-0 items-center justify-center rounded bg-black px-2.5 py-1 text-white">
                    <span className="text-sm font-bold">
                      x{lineItem.quantity}
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    {formatUSD(lineItem.unitPriceCents * lineItem.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black pt-4">
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatUSD(slipData.subtotalCents)}</span>
            </div>
            {slipData.discountCents > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span>-{formatUSD(slipData.discountCents)}</span>
              </div>
            )}
            {slipData.surchargeCents > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Fee</span>
                <span>{formatUSD(slipData.surchargeCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Taxes</span>
              <span>{formatUSD(slipData.taxCents)}</span>
            </div>
            {slipData.shippingCents > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatUSD(slipData.shippingCents)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-dashed border-gray-300 pt-2 text-base font-bold">
              <span>Total</span>
              <span>{formatUSD(slipData.totalCents)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
