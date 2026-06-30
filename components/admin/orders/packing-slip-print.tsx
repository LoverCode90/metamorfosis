"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Printer } from "lucide-react"

import { PackingSlipLayout } from "@/components/admin/orders/packing-slip-layout"
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
import type { PackingSlipData } from "@/lib/admin/packing-slip-types"

interface PackingSlipPrintProps {
  slipData: PackingSlipData
}

/** In-page packing slip preview and print for store pickup orders. */
export function PackingSlipPrint({ slipData }: PackingSlipPrintProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `packing-slip-${slipData.orderId.slice(0, 8)}`,
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
            Order #{slipData.orderId.slice(0, 8).toUpperCase()}
            {slipData.isPickup ? " · Store Pickup" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="border-border max-h-[min(60vh,520px)] overflow-y-auto rounded-lg border">
          <div ref={printRef}>
            <PackingSlipLayout slipData={slipData} />
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
