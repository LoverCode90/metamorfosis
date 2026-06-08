"use client"

import { CircleAlert, X } from "lucide-react"

interface PaymentToastProps {
  open: boolean
  onClose: () => void
}

// Floating crimson-bordered error toast (declined payment).
export function PaymentToast({ open, onClose }: PaymentToastProps) {
  if (!open) return null

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-sm animate-in fade-in slide-in-from-bottom-4 rounded-lg border-l-4 border-destructive bg-card p-4 shadow-lg ring-1 ring-border"
    >
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Payment Declined
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Insufficient funds. Please try another card.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
