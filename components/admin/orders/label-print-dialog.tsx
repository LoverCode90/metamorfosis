"use client"

import { useRef, useState } from "react"
import {
  AlertTriangle,
  Download,
  ExternalLink,
  Loader2,
  Printer,
} from "lucide-react"

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
  const [iframeReady, setIframeReady] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const pdfUrl = `/api/admin/orders/${orderId}/label/pdf`
  const downloadUrl = `${pdfUrl}?download=1`

  async function handlePrint() {
    setIsPrinting(true)
    try {
      const frame = iframeRef.current
      if (frame?.contentWindow && iframeReady) {
        frame.contentWindow.focus()
        frame.contentWindow.print()
        return
      }

      const response = await fetch(pdfUrl)
      if (!response.ok) throw new Error("Could not load label PDF")
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const printWindow = window.open(blobUrl, "_blank")
      if (!printWindow)
        throw new Error("Pop-up blocked — allow pop-ups to print")
      printWindow.addEventListener("load", () => {
        printWindow.focus()
        printWindow.print()
      })
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (printError: unknown) {
      const message =
        printError instanceof Error ? printError.message : "Print failed"
      window.alert(message)
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setIframeReady(false)
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="flex max-h-[90dvh] min-h-0 flex-col gap-4 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-w-2xl sm:p-6">
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

        <div className="border-border min-h-0 flex-1 overflow-y-auto rounded-lg border bg-white">
          <iframe
            ref={iframeRef}
            src={open ? pdfUrl : undefined}
            title="Shipping label"
            onLoad={() => setIframeReady(true)}
            className="h-[min(50dvh,400px)] min-h-[240px] w-full"
          />
        </div>

        <DialogFooter className="shrink-0">
          <div className="flex w-full flex-wrap gap-2">
            <Button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || (!iframeReady && open)}
            >
              {isPrinting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
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
