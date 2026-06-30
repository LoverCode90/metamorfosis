"use client"

import { useAdminPrefs } from "@/components/admin/admin-shell"
import { LabelPrintActions } from "@/components/admin/orders/label-print-actions"
import { LabelPrintTestModeBanner } from "@/components/admin/orders/label-print-test-mode-banner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLabelPrintAction } from "@/hooks/use-label-print-action"
import { cn } from "@/lib/utils"

interface LabelPrintDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  trackingNumber?: string | null
  carrier?: string | null
  shippoTestMode?: boolean
}

/** In-app dialog for viewing and printing a Shippo carrier label PDF. */
export function LabelPrintDialog({
  orderId,
  open,
  onOpenChange,
  trackingNumber,
  carrier,
  shippoTestMode = false,
}: LabelPrintDialogProps) {
  const { theme } = useAdminPrefs()
  const {
    iframeRef,
    pdfUrl,
    isPrinting,
    isPrintDisabled,
    handlePrint,
    markIframeReady,
    resetIframeReady,
  } = useLabelPrintAction({ orderId, isDialogOpen: open })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetIframeReady()
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        className={cn(
          "bg-background text-foreground flex max-h-[90dvh] min-h-0 flex-col gap-4 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-w-2xl sm:p-6",
          theme === "dark" && "dark",
        )}
      >
        <DialogHeader>
          <DialogTitle>Shipping Label</DialogTitle>
          <DialogDescription>
            {trackingNumber ? (
              <>
                Tracking {trackingNumber}
                {carrier ? ` · ${carrier}` : ""}
              </>
            ) : (
              "Carrier label ready to print."
            )}
          </DialogDescription>
        </DialogHeader>

        {shippoTestMode && <LabelPrintTestModeBanner />}

        <div className="border-border flex min-h-0 flex-1 items-center justify-center overflow-y-auto rounded-lg border bg-neutral-100 p-2 dark:bg-neutral-900">
          <iframe
            ref={iframeRef}
            src={open ? pdfUrl : undefined}
            title="Shipping label"
            onLoad={markIframeReady}
            className="h-[min(55dvh,480px)] min-h-[320px] w-full max-w-[240px] bg-white"
          />
        </div>

        <DialogFooter className="shrink-0">
          <LabelPrintActions
            orderId={orderId}
            isPrinting={isPrinting}
            isPrintDisabled={isPrintDisabled}
            onPrintClick={handlePrint}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
