import { EvidenceGallery } from "@/components/admin/cases/evidence-gallery"
import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
import { cn } from "@/lib/utils"

interface CaseEvidenceCardProps {
  caseId: string
  className?: string
}

/** Evidence photos card for the case detail grid. */
export function CaseEvidenceCard({ caseId, className }: CaseEvidenceCardProps) {
  return (
    <section
      className={cn(
        ADMIN_SERVER_CARD_CLASS,
        "flex min-h-[min(520px,70dvh)] flex-col p-5 sm:p-6",
        className,
      )}
    >
      <h2 className="text-foreground mb-4 text-sm font-semibold tracking-tight">
        Evidence photos
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EvidenceGallery caseId={caseId} />
      </div>
    </section>
  )
}
