import { Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"

/** View/download links for a product's color-chart PDF, with a recommendation. */
export function ProductColorCharts({ pdfUrl }: { pdfUrl: string }) {
  const href = `/color-charts/${pdfUrl}`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          render={<a href={href} target="_blank" rel="noopener noreferrer" />}
        >
          <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
          View Chart
        </Button>
        <Button variant="outline" size="sm" render={<a href={href} download />}>
          <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
          Download Chart
        </Button>
      </div>
      <p className="border-accent-violet/30 bg-accent-violet/10 text-accent-violet rounded-lg border px-4 py-2.5 text-xs font-medium lg:text-sm">
        We recommend viewing the color chart to see accurate shades.
      </p>
    </div>
  )
}
