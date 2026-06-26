"use client"

import { useEffect, useState } from "react"
import { Clock, ShieldCheck, X, AlertTriangle } from "lucide-react"
import { CANCEL_WINDOW_MINUTES } from "@/lib/types"
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

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const padTwo = (value: number) => value.toString().padStart(2, "0")
  return `${padTwo(hours)}:${padTwo(minutes)}:${padTwo(seconds)}`
}

export function CancelWindow({
  placedAt,
  canceled,
  onCancel,
}: CancelWindowProps) {
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
          <p className="text-foreground text-sm font-semibold">
            Order canceled
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            A full refund has been issued automatically. Funds return to your
            original payment method within 3–5 business days.
          </p>
        </div>
      </div>
    )
  }

  const expired = remaining <= 0

  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <span className="bg-muted text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <Clock className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="flex-1">
          <p className="text-foreground text-sm font-semibold">
            {expired ? "Cancellation window closed" : "Changed your mind?"}
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {expired
              ? "Your order is already being prepared for shipment."
              : "Cancel within the window for a full, immediate refund — no questions asked."}
          </p>

          {!expired && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="bg-foreground text-background inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-sm font-semibold tabular-nums">
                {formatCountdown(remaining)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" strokeWidth={2} />
                Cancel order
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <span className="bg-destructive/10 text-destructive flex h-11 w-11 items-center justify-center rounded-full">
              <AlertTriangle className="h-5 w-5" strokeWidth={2} />
            </span>
            <DialogTitle>
              Are you sure you want to cancel your order?
            </DialogTitle>
            <DialogDescription>
              This cancels your order immediately and automatically issues a
              full refund. This action cannot be undone.
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
