"use client"

import { useState } from "react"
import { BadgeCheck, Loader2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RejectDialog } from "@/components/admin/reject-dialog"
import type { VerificationRow } from "@/lib/admin/verifications"

interface VerificationActionsProps {
  item: VerificationRow
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
}

/** Approve / reject footer for a pending verification (null otherwise). */
export function VerificationActions({
  item,
  onApprove,
  onReject,
}: VerificationActionsProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  if (item.verification_status !== "pending_review") return null

  async function handleApprove() {
    setIsApproving(true)
    try {
      await onApprove(item.id)
    } finally {
      setIsApproving(false)
    }
  }

  async function handleReject(reason: string) {
    await onReject(item.id, reason)
    setShowRejectDialog(false)
  }

  return (
    <>
      <div className="border-border flex flex-col gap-3 border-t px-6 py-4 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowRejectDialog(true)}
          className="h-auto min-h-11 flex-1 py-3 text-base"
        >
          <XCircle className="h-4 w-4 text-rose-400" strokeWidth={1.75} />
          Reject license
        </Button>
        <Button
          size="lg"
          onClick={() => void handleApprove()}
          disabled={isApproving}
          className="h-auto min-h-11 flex-1 py-3 text-base"
        >
          {isApproving ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <BadgeCheck className="h-4 w-4" strokeWidth={2} />
          )}
          {isApproving ? "Approving…" : "Approve license"}
        </Button>
      </div>

      {showRejectDialog && (
        <RejectDialog
          userName={item.full_name}
          onConfirm={(reason) => handleReject(reason)}
          onClose={() => setShowRejectDialog(false)}
        />
      )}
    </>
  )
}
