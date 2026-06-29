"use client"

import { useRouter } from "next/navigation"
import { MessageCircle, X } from "lucide-react"

import { useNewMessageNotifications } from "@/hooks/use-new-message-notifications"

/**
 * Floating toast shown when support has replied to one of the customer's cases.
 * Clicking it opens the case; dismissable. Mounted in the account layout.
 */
export function NewMessageNotifier() {
  const router = useRouter()
  const { pending, dismiss } = useNewMessageNotifications()

  if (!pending) return null

  return (
    <div
      role="status"
      className="animate-in fade-in slide-in-from-bottom-4 border-border bg-card ring-border fixed right-6 bottom-6 z-50 flex w-[calc(100%-3rem)] max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg ring-1"
    >
      <span className="bg-accent-violet/10 text-accent-violet flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <MessageCircle className="h-4 w-4" />
      </span>
      <button
        type="button"
        onClick={() => router.push(`/orders/${pending.orderId}/case`)}
        className="flex-1 text-left"
      >
        <p className="text-foreground text-sm font-semibold">
          You have a new message from support
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Tap to view your case
        </p>
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
