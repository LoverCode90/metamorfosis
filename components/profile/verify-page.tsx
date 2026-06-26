"use client"

import { VerifyHeader } from "@/components/profile/verify-header"
import { VerifyStatusOverlay } from "@/components/profile/verify-status-overlay"
import {
  InfoStep,
  SummaryStep,
  UploadStep,
} from "@/components/profile/verify-steps"
import { useVerifyWizard } from "@/hooks/use-verify-wizard"

/**
 * Professional license verification wizard (info → upload → summary) with a
 * status overlay for the submission lifecycle. All behavior lives in
 * {@link useVerifyWizard}.
 */
export function VerifyPage() {
  const w = useVerifyWizard()

  return (
    <div className="bg-muted/40 min-h-[calc(100dvh-4rem)]">
      <VerifyHeader
        stepIndex={w.stepIndex}
        showBack={w.step !== "info"}
        isSummary={w.step === "summary"}
        canContinue={w.canContinue}
        isProcessing={w.phase === "processing"}
        onCancel={w.cancel}
        onBack={w.back}
        onNext={w.next}
        onConfirm={() => void w.confirm()}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {w.step === "info" && (
          <InfoStep
            info={w.info}
            onChange={w.setInfo}
            licenseError={w.licenseError}
            licenseHelperText={w.licenseHelperText}
          />
        )}
        {w.step === "upload" && (
          <UploadStep
            file={w.file}
            onFile={w.setFile}
            onClear={() => w.setFile(null)}
          />
        )}
        {w.step === "summary" && <SummaryStep info={w.info} file={w.file} />}
      </main>

      <VerifyStatusOverlay
        phase={w.phase}
        rejectionReason={w.rejectionReason}
        onRetry={w.retry}
      />
    </div>
  )
}
