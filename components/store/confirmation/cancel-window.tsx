"use client"

import { useEffect, useState } from "react"
import { Clock, ShieldCheck, X, AlertTriangle } from "lucide-react"
import { CANCEL_WINDOW_MINUTES } from "@/lib/checkout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CancelWindowProps {
  placedAt: number
  canceled: boolean
  onCancel: () => void
}

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function CancelWindow({ placedAt, canceled, onCancel }: CancelWindowProps) {
  const deadline = placedAt + CANCEL_WINDOW_MINUTES * 60 * 1000
  const [remaining, setRemaining] = useState(() => deadline - Date.now())
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setRemaining(deadline - Date.now()), 1000)
    return () => clearInterval(id)
  }, [deadline])

  function confirmCancel() {
    setConfirmOpen(false)
    onCancel()
  }

  if (canceled) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <ShieldCheck className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Order canceled</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            A full refund has been issued automatically. Funds return to your
            original payment method within 3–5 business days.
          </p>
        </div>
      </div>
    )
  }

  const expired = remaining <= 0

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
          <Clock className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {expired ? "Cancellation window closed" : "Change your mind?"}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {expired
              ? "Your order is now being prepared for dispatch."
              : "Cancel within the window for an instant, automated full refund — no questions asked."}
          </p>

          {!expired && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1 font-mono text-sm font-semibold text-background tabular-nums">
                {format(remaining)}
              </span>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <X className="h-4 w-4" strokeWidth={2} />
                Cancel order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation guard — confirm before issuing the refund. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" strokeWidth={2} />
            </span>
            <DialogTitle>Do you really want to cancel your order?</DialogTitle>
            <DialogDescription>
              This cancels your order immediately and issues a full automated
              refund. This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Keep my order
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Yes, cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
