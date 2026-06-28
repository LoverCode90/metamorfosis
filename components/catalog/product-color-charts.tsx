import { Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"

/** View/download links for a product's color-chart PDF, with a recommendation. */
export function ProductColorCharts({ pdfUrl }: { pdfUrl: string }) {
  const href = `/color-charts/${pdfUrl}`

  return (
    <div className="flex flex-col gap-3 overflow-x-hidden">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<a href={href} target="_blank" rel="noopener noreferrer" />}
        >
          <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
          View Chart
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<a href={href} download />}
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
          Download Chart
        </Button>
      </div>
      <div className="border-accent-amber/40 bg-accent-amber/10 text-accent-amber rounded-lg border p-3 text-xs leading-relaxed font-medium break-words lg:text-sm">
        We recommend viewing the color chart to see accurate shades.
      </div>
    </div>
  )
}
