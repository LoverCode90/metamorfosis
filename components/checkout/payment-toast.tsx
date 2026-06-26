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
      className="animate-in fade-in slide-in-from-bottom-4 border-destructive bg-card ring-border fixed right-6 bottom-6 z-50 w-[calc(100%-3rem)] max-w-sm rounded-lg border-l-4 p-4 shadow-lg ring-1"
    >
      <div className="flex items-start gap-3">
        <CircleAlert className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="text-foreground text-sm font-semibold">
            Payment Declined
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Insufficient funds. Please try another card.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
