"use client"

import { useRef } from "react"
import { AlertTriangle, Download, ExternalLink, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pdfUrl = `/api/admin/orders/${orderId}/label/pdf`
  const downloadUrl = `${pdfUrl}?download=1`

  function handlePrint() {
    const frame = iframeRef.current
    if (!frame?.contentWindow) return
    frame.contentWindow.focus()
    frame.contentWindow.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
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

        {shippoTestMode && (
          <div className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Shippo test mode — this label is marked SAMPLE and cannot be
              mailed. Replace <code className="text-xs">SHIPPO_API_KEY</code> in
              Vercel with a live key from the business Shippo account.
            </p>
          </div>
        )}

        <div className="border-border min-h-[420px] flex-1 overflow-hidden rounded-lg border bg-white">
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            title="Shipping label"
            className="h-[min(60vh,520px)] w-full"
          />
        </div>

        <DialogFooter>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              render={<a href={downloadUrl} download />}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              render={
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in tab
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
