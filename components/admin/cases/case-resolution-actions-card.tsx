import { CaseActions } from "@/components/admin/cases/case-actions"
import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
import { cn } from "@/lib/utils"

interface CaseResolutionActionsCardProps {
  caseId: string
  caseNumber: string
  customerEmail: string
  status: string
  className?: string
}

/** Admin controls to approve, reject, or request more information. */
export function CaseResolutionActionsCard({
  caseId,
  caseNumber,
  customerEmail,
  status,
  className,
}: CaseResolutionActionsCardProps) {
  return (
    <section className={cn(ADMIN_SERVER_CARD_CLASS, "p-5 sm:p-6", className)}>
      <div className="mb-5">
        <h2 className="text-foreground text-sm font-semibold tracking-tight">
          Resolution actions
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Approve, reject, or request more information from the customer.
        </p>
      </div>
      <CaseActions
        caseId={caseId}
        caseNumber={caseNumber}
        customerEmail={customerEmail}
        status={status}
      />
    </section>
  )
}
