"use client"

import { VerificationActions } from "@/components/admin/verification-actions"
import { VerificationInfo } from "@/components/admin/verification-info"
import type { VerificationRow } from "@/lib/admin/verifications"

interface VerificationDetailProps {
  item: VerificationRow
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
}

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
}

const STATUS_COLORS: Record<string, string> = {
  pending_review: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  approved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  rejected: "text-rose-400 bg-rose-400/10 border-rose-400/20",
}

/** Verification review pane: applicant header, submitted info, and actions. */
export function VerificationDetail({
  item,
  onApprove,
  onReject,
}: VerificationDetailProps) {
  const statusClass =
    STATUS_COLORS[item.verification_status] ??
    "text-muted-foreground bg-muted border-border"
  const statusLabel =
    STATUS_LABELS[item.verification_status] ?? item.verification_status

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border/60 border-b px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-foreground font-semibold">{item.full_name}</p>
            <p className="text-muted-foreground mt-0.5 text-sm">{item.email}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <VerificationInfo item={item} />
      <VerificationActions
        item={item}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  )
}
