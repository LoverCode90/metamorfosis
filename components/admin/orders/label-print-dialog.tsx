"use client"

import { useRef } from "react"
import { Download, ExternalLink, Printer } from "lucide-react"

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
  open: boolean
  onOpenChange: (open: boolean) => void
  labelUrl: string | null
  trackingNumber?: string | null
  carrier?: string | null
}

/** In-app dialog for viewing and printing a Shippo carrier label PDF. */
export function LabelPrintDialog({
  open,
  onOpenChange,
  labelUrl,
  trackingNumber,
  carrier,
}: LabelPrintDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

        {labelUrl ? (
          <div className="border-border min-h-[420px] flex-1 overflow-hidden rounded-lg border bg-white">
            <iframe
              ref={iframeRef}
              src={labelUrl}
              title="Shipping label"
              className="h-[min(60vh,520px)] w-full"
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Label URL is not available.
          </p>
        )}

        <DialogFooter>
          <div className="flex flex-wrap gap-2">
            {labelUrl && (
              <>
                <Button type="button" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  render={<a href={labelUrl} download />}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  render={
                    <a
                      href={labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in tab
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
