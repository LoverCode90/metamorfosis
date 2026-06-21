"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface RejectDialogProps {
  userName: string
  onConfirm: (reason: string) => Promise<void>
  onClose: () => void
}

export function RejectDialog({
  userName,
  onConfirm,
  onClose,
}: RejectDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isValid = reason.trim().length >= 10

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setError("")
    setIsSubmitting(true)
    try {
      await onConfirm(reason.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Reject verification"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="border-border bg-background relative w-full max-w-md rounded-2xl border p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-foreground text-base font-semibold">
              Reject verification
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {userName} will be notified by email.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border-border text-muted-foreground hover:bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label
              htmlFor="reason"
              className="text-foreground mb-1.5 block text-sm font-medium"
            >
              Rejection reason
              <span className="text-muted-foreground ml-1 text-xs font-normal">
                (min 10 characters — shown to the user)
              </span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="e.g. The document was blurry and the license number could not be read. Please re-upload a clear photo."
              className="border-border bg-bg-inset text-foreground placeholder:text-muted-foreground focus:border-foreground w-full resize-none rounded-lg border px-3 py-2.5 text-sm transition-colors outline-none"
            />
            <div className="mt-1 flex justify-between">
              {error ? (
                <p className="text-xs text-rose-400">{error}</p>
              ) : (
                <span />
              )}
              <p className="text-muted-foreground text-xs">
                {reason.length}/500
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="border-border text-foreground hover:bg-muted h-9 rounded-md border px-4 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="h-9 rounded-md bg-rose-600 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
