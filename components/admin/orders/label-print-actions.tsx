import { Download, ExternalLink, Loader2, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { buildLabelPrintUrls } from "@/lib/admin/label-print-urls"

interface LabelPrintActionsProps {
  orderId: string
  isPrinting: boolean
  isPrintDisabled: boolean
  onPrintClick: () => void
}

/** Footer actions for the shipping label print dialog. */
export function LabelPrintActions({
  orderId,
  isPrinting,
  isPrintDisabled,
  onPrintClick,
}: LabelPrintActionsProps) {
  const { pdfUrl, downloadUrl } = buildLabelPrintUrls(orderId)

  return (
    <div className="flex w-full flex-wrap gap-2">
      <Button type="button" onClick={onPrintClick} disabled={isPrintDisabled}>
        {isPrinting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Printer className="mr-2 h-4 w-4" />
        )}
        Print
      </Button>
      <Button variant="outline" render={<a href={downloadUrl} download />}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button
        variant="outline"
        render={<a href={pdfUrl} target="_blank" rel="noopener noreferrer" />}
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        Open in tab
      </Button>
    </div>
  )
}
