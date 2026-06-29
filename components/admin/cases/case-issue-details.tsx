import { formatCaseStatus } from "@/lib/utils/format"
import type { AdminCaseDetail } from "@/lib/cases/types"

/** Labelled metadata cell used in the issue grid. */
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </p>
      {children}
    </div>
  )
}

/** Reason, item, condition, optional resolution + the customer explanation. */
export function CaseIssueDetails({ caseData }: { caseData: AdminCaseDetail }) {
  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <h2 className="text-foreground mb-4 text-lg font-semibold">
        Issue Details
      </h2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Field label="Reason">
          <p className="text-foreground font-medium">
            {formatCaseStatus(caseData.reason)}
          </p>
        </Field>
        <Field label="Item">
          <p className="text-foreground font-medium">
            {caseData.product_variations?.name_en}
          </p>
          <p className="text-muted-foreground text-sm">
            SKU: {caseData.product_variations?.sku}
          </p>
        </Field>
        <Field label="Item Condition">
          <p className="text-foreground font-medium">
            {caseData.condition
              ? formatCaseStatus(caseData.condition)
              : "Not provided"}
          </p>
        </Field>
        {caseData.more_info_requested_at && (
          <Field label="More Info Requested">
            <p className="text-foreground font-medium">
              {new Date(caseData.more_info_requested_at).toLocaleString()}
            </p>
          </Field>
        )}
      </div>

      {caseData.resolution && (
        <div className="mb-6">
          <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
            Resolution (sent to customer)
          </p>
          <div className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">
            {caseData.resolution}
          </div>
        </div>
      )}

      <div>
        <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
          Customer Explanation
        </p>
        <div className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">
          {caseData.explanation}
        </div>
      </div>
    </section>
  )
}
