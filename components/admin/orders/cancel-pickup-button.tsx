"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CancelPickupButtonProps {
  orderId: string
  size?: "default" | "lg"
  className?: string
}

export function CancelPickupButton({
  orderId,
  size = "default",
  className,
}: CancelPickupButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel-pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()

      if (data.ok) {
        setOpen(false)
        router.refresh()
      } else {
        alert(data.error || "Failed to cancel pickup order")
      }
    } catch {
      alert("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        size={size}
        onClick={() => setOpen(true)}
        className={cn("h-auto min-h-11 py-3 text-base", className)}
      >
        Cancel order & refund
      </Button>

      <Dialog open={open} onOpenChange={(o) => !loading && setOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel this pickup?</DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              This refunds the customer through Square and sends them a
              cancellation email. Only use this if the order should not be
              picked up.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-foreground mb-1 block text-sm font-medium">
              Reason (optional)
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer did not pick up"
              disabled={loading}
            />
          </div>

          <DialogFooter className="gap-2 sm:flex-col">
            <Button
              variant="destructive"
              size="lg"
              onClick={handleCancel}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Canceling…" : "Yes, cancel and refund"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="w-full"
            >
              No — keep this order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
