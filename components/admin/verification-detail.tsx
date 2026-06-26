"use client"

import { useState } from "react"
import {
  BadgeCheck,
  Calendar,
  ExternalLink,
  FileText,
  Loader2,
  User,
  XCircle,
} from "lucide-react"
import { RejectDialog } from "./reject-dialog"
import type { VerificationRow } from "@/lib/admin/verifications"
import { formatDate } from "@/lib/utils/format"

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

export function VerificationDetail({
  item,
  onApprove,
  onReject,
}: VerificationDetailProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isLoadingDoc, setIsLoadingDoc] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  async function handleApprove() {
    setIsApproving(true)
    try {
      await onApprove(item.id)
    } finally {
      setIsApproving(false)
    }
  }

  async function handleViewDocument() {
    setIsLoadingDoc(true)
    try {
      const res = await fetch(
        `/api/admin/verifications/${item.id}/document-url`,
      )
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer")
      }
    } finally {
      setIsLoadingDoc(false)
    }
  }

  async function handleReject(reason: string) {
    await onReject(item.id, reason)
    setShowRejectDialog(false)
  }

  const isPending = item.verification_status === "pending_review"
  const statusClass =
    STATUS_COLORS[item.verification_status] ??
    "text-muted-foreground bg-muted border-border"

  return (
    <div className="border-border bg-background flex h-full flex-col rounded-xl border">
      <div className="border-border border-b px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-foreground font-semibold">{item.full_name}</p>
            <p className="text-muted-foreground mt-0.5 text-sm">{item.email}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
          >
            {STATUS_LABELS[item.verification_status] ??
              item.verification_status}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* Profile fields */}
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

        {/* Rejection reason (if present) */}
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

        {/* Document */}
        {item.document_url && (
          <section>
            <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              Document
            </h3>
            <button
              type="button"
              onClick={() => void handleViewDocument()}
              disabled={isLoadingDoc}
              className="border-border text-foreground hover:bg-muted inline-flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors disabled:opacity-50"
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
            </button>
            <p className="text-muted-foreground mt-1.5 px-1 text-xs">
              Opens in a new tab. Link expires in 60 seconds.
            </p>
          </section>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="border-border flex gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={() => setShowRejectDialog(true)}
            className="border-border text-foreground hover:bg-muted inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors"
          >
            <XCircle className="h-4 w-4 text-rose-400" strokeWidth={1.75} />
            Reject
          </button>
          <button
            type="button"
            onClick={() => void handleApprove()}
            disabled={isApproving}
            className="bg-foreground text-background inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <BadgeCheck className="h-4 w-4" strokeWidth={2} />
            )}
            {isApproving ? "Approving…" : "Approve"}
          </button>
        </div>
      )}

      {showRejectDialog && (
        <RejectDialog
          userName={item.full_name}
          onConfirm={(reason) => handleReject(reason)}
          onClose={() => setShowRejectDialog(false)}
        />
      )}
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
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
