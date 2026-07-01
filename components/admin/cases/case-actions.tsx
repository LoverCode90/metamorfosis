"use client"

import { useState } from "react"
import { Check, Loader2, Mail, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CaseResolutionDialog } from "@/components/admin/cases/case-resolution-dialog"
import { useCaseActions } from "@/hooks/use-case-actions"

interface CaseActionsProps {
  caseId: string
  caseNumber: string
  customerEmail: string
  status: string
}

const RESOLVED_STATUSES = ["closed", "rejected", "approved", "fraud"]

/** Approve / Reject / Request More Info controls for an admin case. */
export function CaseActions({
  caseId,
  caseNumber,
  customerEmail,
  status,
}: CaseActionsProps) {
  const actions = useCaseActions({ caseId, customerEmail, caseNumber })
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null)
  const [resolution, setResolution] = useState("")

  if (RESOLVED_STATUSES.includes(status)) {
    return (
      <p className="text-muted-foreground text-base leading-relaxed">
        This case is finished. No further action is needed.
      </p>
    )
  }

  async function confirmDialog() {
    const ok =
      dialog === "approve"
        ? await actions.approve(resolution)
        : await actions.reject(resolution)
    if (ok) {
      setDialog(null)
      setResolution("")
    }
  }

  const isApprove = dialog === "approve"

  return (
    <div className="space-y-4">
      {actions.error && !dialog && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm font-medium">
          {actions.error}
        </div>
      )}

      <p className="text-foreground text-sm font-semibold">
        What would you like to do?
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          size="lg"
          onClick={() => setDialog("approve")}
          disabled={!!actions.isProcessing}
          className="h-auto min-h-11 flex-1 py-3 text-base"
        >
          <Check className="mr-2 h-4 w-4" />
          Approve case
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={() => setDialog("reject")}
          disabled={!!actions.isProcessing}
          className="h-auto min-h-11 flex-1 py-3 text-base"
        >
          <X className="mr-2 h-4 w-4" />
          Reject case
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={actions.requestMoreInfo}
          disabled={!!actions.isProcessing}
          className="h-auto min-h-11 flex-1 py-3 text-base"
        >
          {actions.isProcessing === "request-info" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Ask customer for more info
        </Button>
      </div>

      <CaseResolutionDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        title={isApprove ? "Approve this case?" : "Reject this case?"}
        description={
          isApprove
            ? "The customer will be emailed that their case was approved. You can add an optional note."
            : "The customer will be emailed that their case was rejected. Please explain why."
        }
        required={!isApprove}
        confirmLabel={isApprove ? "Yes, approve case" : "Yes, reject case"}
        confirmVariant={isApprove ? "default" : "destructive"}
        value={resolution}
        onChange={setResolution}
        onConfirm={confirmDialog}
        loading={
          actions.isProcessing === "approve" ||
          actions.isProcessing === "reject"
        }
        error={dialog ? actions.error : undefined}
      />
    </div>
  )
}
