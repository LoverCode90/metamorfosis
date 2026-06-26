"use client"

import { Calendar, ExternalLink, FileText, Loader2, User } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { useVerificationDocument } from "@/hooks/use-verification-document"
import type { VerificationRow } from "@/lib/admin/verifications"
import { formatDate } from "@/lib/utils/format"

/** A label / value row in the submitted-info list. */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-muted-foreground flex items-center gap-1.5 text-sm">
        {icon}
        {label}
      </dt>
      <dd className="text-foreground truncate text-right text-sm font-medium">
        {value}
      </dd>
    </div>
  )
}

/** Scrollable body of the verification detail: submitted info + document. */
export function VerificationInfo({ item }: { item: VerificationRow }) {
  const { isLoading: isLoadingDoc, viewDocument } = useVerificationDocument(
    item.id,
  )

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
      <section>
        <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
          Submitted Info
        </h3>
        <dl className="border-border divide-border bg-muted/30 divide-y rounded-xl border text-sm">
          <DetailRow
            icon={<User className="h-4 w-4" />}
            label="Role"
            value={item.role}
          />
          <DetailRow
            icon={<FileText className="h-4 w-4" />}
            label="License #"
            value={item.license_number ?? "—"}
          />
          <DetailRow
            icon={<Calendar className="h-4 w-4" />}
            label="Expiration"
            value={
              item.expiration_date ? formatDate(item.expiration_date) : "—"
            }
          />
          <DetailRow label="Business" value={item.business_name ?? "—"} />
          <DetailRow label="Submitted" value={formatDate(item.updated_at)} />
        </dl>
      </section>

      {item.rejection_reason && (
        <section>
          <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Rejection Reason
          </h3>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
            <p className="text-sm leading-relaxed text-rose-300">
              {item.rejection_reason}
            </p>
          </div>
        </section>
      )}

      {item.document_url && (
        <section>
          <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Document
          </h3>
          <Button
            variant="outline"
            onClick={() => void viewDocument()}
            disabled={isLoadingDoc}
            className="h-auto w-full justify-between px-4 py-3"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              View license document
            </span>
            {isLoadingDoc ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
            ) : (
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
            )}
          </Button>
          <p className="text-muted-foreground mt-1.5 px-1 text-xs">
            Opens in a new tab. Link expires in 60 seconds.
          </p>
        </section>
      )}
    </div>
  )
}
