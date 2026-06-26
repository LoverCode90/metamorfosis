import Link from "next/link"

import { Button } from "@/components/ui/button"
import { formatCaseStatus } from "@/lib/utils/format"
import type { CaseWithMessages } from "@/lib/cases/types"
import { cn } from "@/lib/utils"

/** A label / value row in the case details grid. */
function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("col-span-2", valueClassName)}>{value}</span>
    </div>
  )
}

/** Case metadata (status, reason, explanation) and the return label download. */
export function CaseDetailsSection({
  caseData,
}: {
  caseData: CaseWithMessages
}) {
  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <h2 className="text-foreground mb-4 text-lg font-semibold">
        Case Details
      </h2>
      <div className="space-y-4 text-sm">
        <DetailRow
          label="Status"
          value={formatCaseStatus(caseData.status)}
          valueClassName="font-medium"
        />
        <DetailRow label="Reason" value={formatCaseStatus(caseData.reason)} />
        <DetailRow
          label="Explanation"
          value={caseData.explanation}
          valueClassName="whitespace-pre-wrap"
        />
      </div>

      {caseData.prepaid_label_url && (
        <div className="border-border mt-6 border-t pt-6">
          <h3 className="text-foreground mb-2 font-medium">Return Label</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Please print this label and attach it to your return package.
          </p>
          <Button
            render={
              <Link
                href={caseData.prepaid_label_url}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Download Label
          </Button>
        </div>
      )}
    </section>
  )
}
