"use client"

import { Button } from "@/components/ui/button"
import { VerifyStepIndicator } from "@/components/profile/verify-steps"

interface VerifyHeaderProps {
  stepIndex: number
  showBack: boolean
  isSummary: boolean
  canContinue: boolean
  isProcessing: boolean
  onCancel: () => void
  onBack: () => void
  onNext: () => void
  onConfirm: () => void
}

/** Sticky wizard header: cancel, step indicator, and back/next/confirm nav. */
export function VerifyHeader({
  stepIndex,
  showBack,
  isSummary,
  canContinue,
  isProcessing,
  onCancel,
  onBack,
  onNext,
  onConfirm,
}: VerifyHeaderProps) {
  return (
    <header className="border-border bg-background sticky top-0 z-10 border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-muted-foreground"
        >
          Cancel
        </Button>

        <VerifyStepIndicator activeIndex={stepIndex} />

        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="hidden h-9 sm:inline-flex"
            >
              Back
            </Button>
          )}
          {isSummary ? (
            <Button
              size="sm"
              className="h-9"
              onClick={onConfirm}
              disabled={isProcessing}
            >
              Confirm
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-9"
              onClick={onNext}
              disabled={!canContinue}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
