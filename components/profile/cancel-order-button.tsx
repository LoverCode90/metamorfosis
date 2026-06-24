"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CancelOrderButtonProps {
  orderId: string
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      })
      const data = await res.json()

      if (data.ok) {
        setOpen(false)
        router.refresh()
      } else {
        alert(data.error || "Failed to cancel order")
      }
    } catch {
      alert("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "Cancelling..." : "Cancel Order"}
      </button>

      <Dialog open={open} onOpenChange={(o) => !loading && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to cancel this order?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. You will receive a full refund to
              your payment method.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? "Cancelling..." : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
