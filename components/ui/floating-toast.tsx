"use client"

import { useEffect } from "react"
import { CircleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"

interface FloatingToastProps {
  /** Message to display. When empty/null the toast is hidden. */
  message: string | null
  onClose: () => void
  /** Auto-dismiss delay in milliseconds. */
  durationMs?: number
}

/**
 * Floating corner toast (top-right) that stays visible regardless of scroll
 * position. Presentational only — the message and dismissal are driven by the
 * parent. Auto-dismisses after {@link FloatingToastProps.durationMs}.
 */
export function FloatingToast({
  message,
  onClose,
  durationMs = 4000,
}: FloatingToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, durationMs)
    return () => clearTimeout(timer)
  }, [message, durationMs, onClose])

  if (!message) return null

  return (
    <div
      role="alert"
      className={cn(
        "animate-in fade-in slide-in-from-top-4 fixed top-6 right-6 z-50",
        "border-destructive bg-card ring-border w-[calc(100%-3rem)] max-w-sm",
        "rounded-lg border-l-4 p-4 shadow-lg ring-1",
      )}
    >
      <div className="flex items-start gap-3">
        <CircleAlert className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-foreground flex-1 text-sm font-medium">{message}</p>
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
