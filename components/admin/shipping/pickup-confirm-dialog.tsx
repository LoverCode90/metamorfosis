"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CARRIER_PICKUP_SLOTS,
  type CarrierPickupSlotKey,
} from "@/lib/admin/pickup-slots"
import { pickupCarrierLabel } from "@/lib/admin/pickup-carrier"
import type { PickupCarrierKind } from "@/lib/admin/pickup-carrier"
import { format } from "date-fns"

interface PickupConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pickupDate: Date | undefined
  slotKey: CarrierPickupSlotKey | null
  selectedCount: number
  carriers: PickupCarrierKind[]
  onConfirm: () => void
  isSubmitting?: boolean
}

export function PickupConfirmDialog({
  open,
  onOpenChange,
  pickupDate,
  slotKey,
  selectedCount,
  carriers,
  onConfirm,
  isSubmitting = false,
}: PickupConfirmDialogProps) {
  const slot = slotKey ? CARRIER_PICKUP_SLOTS[slotKey] : null
  const carrierLabels = [...new Set(carriers.map(pickupCarrierLabel))]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm pickup</DialogTitle>
          <DialogDescription>
            Are you sure you want to schedule this pickup?
          </DialogDescription>
        </DialogHeader>

        <ul className="text-muted-foreground space-y-2 py-2 text-sm">
          <li>
            <span className="text-foreground font-medium">Packages:</span>{" "}
            {selectedCount}
          </li>
          <li>
            <span className="text-foreground font-medium">Carriers:</span>{" "}
            {carrierLabels.join(" + ")}
          </li>
          {pickupDate && (
            <li>
              <span className="text-foreground font-medium">Date:</span>{" "}
              {format(pickupDate, "MMM d, yyyy")}
            </li>
          )}
          {slot && (
            <li>
              <span className="text-foreground font-medium">Window:</span>{" "}
              {slot.label}
            </li>
          )}
        </ul>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Confirming…
              </>
            ) : (
              "Confirm pickup"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
