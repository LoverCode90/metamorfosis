"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Package, Printer, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatUSD } from "@/lib/utils/format"

export interface PackingSlipItem {
  id: string
  quantity: number
  unitPriceCents: number
  productName: string
  variationName: string
}

export interface PackingSlipAddress {
  fullName?: string
  phone?: string
  email?: string
  streetLine1?: string
  streetLine2?: string
  city?: string
  state?: string
  zip?: string
}

export interface PackingSlipData {
  orderId: string
  createdAt: string
  isPickup: boolean
  address: PackingSlipAddress | null
  items: PackingSlipItem[]
  subtotalCents: number
  discountCents: number
  surchargeCents: number
  taxCents: number
  shippingCents: number
  totalCents: number
}

interface PackingSlipPrintProps {
  slip: PackingSlipData
}

function SlipContent({ slip }: { slip: PackingSlipData }) {
  const { address, items } = slip

  return (
    <div className="packing-slip-print bg-white p-4 font-sans text-black">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center border-b border-black pb-4 text-center">
          <Store className="mb-2 h-8 w-8" strokeWidth={2} />
          <h1 className="text-xl font-bold tracking-tight uppercase">
            Metamorfosis
          </h1>
          <p className="text-sm font-medium">
            Order #{slip.orderId.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(slip.createdAt).toLocaleString()}
          </p>
        </div>

        {slip.isPickup && (
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
          <p className="text-lg font-bold">{address?.fullName || "Guest"}</p>
          {address?.phone && (
            <p className="text-sm font-medium">{address.phone}</p>
          )}
          {address?.email && (
            <p className="text-sm font-medium">{address.email}</p>
          )}
          {address?.streetLine1 && (
            <div className="mt-1 text-sm font-medium">
              <p>{address.streetLine1}</p>
              {address.streetLine2 && <p>{address.streetLine2}</p>}
              <p>
                {address.city}, {address.state} {address.zip}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
            <Package className="h-4 w-4" strokeWidth={2} />
            Items ({items.length})
          </h2>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 border-t border-dashed border-gray-300 pt-3"
              >
                <div className="flex flex-col">
                  <span className="text-base leading-tight font-bold">
                    {item.productName}
                  </span>
                  <span className="mt-0.5 text-sm font-medium text-gray-600">
                    {item.variationName}
                  </span>
                  <span className="mt-1 text-xs font-medium">
                    {formatUSD(item.unitPriceCents)} x {item.quantity}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex shrink-0 items-center justify-center rounded bg-black px-2.5 py-1 text-white">
                    <span className="text-sm font-bold">x{item.quantity}</span>
                  </div>
                  <span className="text-sm font-bold">
                    {formatUSD(item.unitPriceCents * item.quantity)}
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
              <span>{formatUSD(slip.subtotalCents)}</span>
            </div>
            {slip.discountCents > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span>-{formatUSD(slip.discountCents)}</span>
              </div>
            )}
            {slip.surchargeCents > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Fee</span>
                <span>{formatUSD(slip.surchargeCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Taxes</span>
              <span>{formatUSD(slip.taxCents)}</span>
            </div>
            {slip.shippingCents > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatUSD(slip.shippingCents)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-dashed border-gray-300 pt-2 text-base font-bold">
              <span>Total</span>
              <span>{formatUSD(slip.totalCents)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** In-page packing slip preview and print for store pickup orders. */
export function PackingSlipPrint({ slip }: PackingSlipPrintProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `packing-slip-${slip.orderId.slice(0, 8)}`,
  })

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button">
            <Printer className="mr-2 h-4 w-4" />
            Print Packing Slip
          </Button>
        }
      />
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Packing Slip</DialogTitle>
          <DialogDescription>
            Order #{slip.orderId.slice(0, 8).toUpperCase()}
            {slip.isPickup ? " · Store Pickup" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="border-border max-h-[min(60vh,520px)] overflow-y-auto rounded-lg border">
          <div ref={printRef}>
            <SlipContent slip={slip} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => handlePrint()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
