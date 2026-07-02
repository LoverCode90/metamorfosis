import { formatCaseStatus } from "@/lib/utils/format"
import { caseReasonLabel } from "@/lib/profile/case-reasons"
import { itemLabel } from "@/lib/orders/item-label"
import { AdminProductThumb } from "@/components/admin/admin-product-thumb"
import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
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
  const productLabel = itemLabel(
    caseData.product_variations?.product_translations?.name_en,
    caseData.product_variations?.name_en,
  )

  return (
    <section className={`${ADMIN_SERVER_CARD_CLASS} p-5 sm:p-6`}>
      <h2 className="text-foreground mb-4 text-sm font-semibold">
        Issue Details
      </h2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Field label="Reason">
          <p className="text-foreground font-medium">
            {caseReasonLabel(caseData.reason)}
          </p>
        </Field>
        <Field label="Item">
          <div className="mt-1 flex items-start gap-3">
            <AdminProductThumb
              variation={caseData.product_variations}
              alt={productLabel}
              size="md"
            />
            <div className="min-w-0">
              <p className="text-foreground font-medium">{productLabel}</p>
              <p className="text-muted-foreground text-sm">
                SKU: {caseData.product_variations?.sku}
              </p>
            </div>
          </div>
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
