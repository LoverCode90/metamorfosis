"use client"

import { Loader2, Printer, Truck } from "lucide-react"

import { LabelPrintDialog } from "@/components/admin/orders/label-print-dialog"
import { Button } from "@/components/ui/button"

interface AdminShipLabelControlsProps {
  orderId: string
  isLoading: boolean
  errorMessage: string
  hasExistingLabel: boolean
  labelDialogOpen: boolean
  labelTrackingNumber: string | null
  labelCarrier: string | null
  shippoTestMode: boolean
  onGenerateLabel: () => void
  onReprintLabel: () => void
  onLabelDialogOpenChange: (open: boolean) => void
}

/** Generate or reprint a Shippo shipping label for an order. */
export function AdminShipLabelControls({
  orderId,
  isLoading,
  errorMessage,
  hasExistingLabel,
  labelDialogOpen,
  labelTrackingNumber,
  labelCarrier,
  shippoTestMode,
  onGenerateLabel,
  onReprintLabel,
  onLabelDialogOpenChange,
}: AdminShipLabelControlsProps) {
  return (
    <div className="space-y-2">
      {hasExistingLabel ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onReprintLabel}
          disabled={isLoading}
          className="h-auto min-h-11 w-full py-3 text-base sm:w-auto"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Printer className="mr-2 h-4 w-4" />
          )}
          Reprint label
        </Button>
      ) : (
        <Button
          type="button"
          size="lg"
          onClick={onGenerateLabel}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-auto min-h-11 w-full py-3 text-base shadow-[0_0_20px_-4px_var(--primary)] sm:w-auto"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Truck className="mr-2 h-4 w-4" />
          )}
          Print shipping label
        </Button>
      )}

      {errorMessage && (
        <p className="text-destructive text-sm font-medium">{errorMessage}</p>
      )}

      <LabelPrintDialog
        orderId={orderId}
        open={labelDialogOpen}
        onOpenChange={onLabelDialogOpenChange}
        trackingNumber={labelTrackingNumber}
        carrier={labelCarrier}
        shippoTestMode={shippoTestMode}
      />
    </div>
  )
}
