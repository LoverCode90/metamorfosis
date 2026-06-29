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
      <p className="text-muted-foreground text-sm">
        This case has been resolved. No further actions are available.
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

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setDialog("approve")}
          disabled={!!actions.isProcessing}
        >
          <Check className="mr-2 h-4 w-4" />
          Approve
        </Button>

        <Button
          variant="destructive"
          onClick={() => setDialog("reject")}
          disabled={!!actions.isProcessing}
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>

        <Button
          variant="outline"
          onClick={actions.requestMoreInfo}
          disabled={!!actions.isProcessing}
        >
          {actions.isProcessing === "request-info" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Request More Info
        </Button>
      </div>

      <CaseResolutionDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        title={isApprove ? "Approve case" : "Reject case"}
        description={
          isApprove
            ? "Approve this case and notify the customer. You may add an optional note."
            : "Reject this case. A resolution message is required and will be emailed to the customer."
        }
        required={!isApprove}
        confirmLabel={isApprove ? "Approve case" : "Reject case"}
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
