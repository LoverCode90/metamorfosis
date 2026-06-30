import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
import { cn } from "@/lib/utils"
import type { AdminCaseDetail } from "@/lib/cases/types"

interface CaseCustomerInfoCardProps {
  caseData: AdminCaseDetail
  className?: string
}

/** Customer info card for case detail. */
export function CaseCustomerInfoCard({
  caseData,
  className,
}: CaseCustomerInfoCardProps) {
  const customer = caseData.profiles

  return (
    <section className={cn(ADMIN_SERVER_CARD_CLASS, "p-5 sm:p-6", className)}>
      <h3 className="text-foreground mb-4 text-sm font-semibold">
        Customer Info
      </h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs uppercase">Name</p>
          <p className="font-medium break-words">{customer?.full_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">Email</p>
          <a
            href={`mailto:${customer?.email}`}
            className="text-foreground break-all hover:underline"
          >
            {customer?.email}
          </a>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">Phone</p>
          <p>{customer?.phone_number || "Not provided"}</p>
        </div>
      </div>
    </section>
  )
}
