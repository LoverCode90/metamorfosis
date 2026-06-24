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
import { Input } from "@/components/ui/input"

export function AdminOrderActions({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
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
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Cancel Order
      </Button>

      <Dialog open={open} onOpenChange={(o) => !loading && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              This will refund the customer via Square and email them
              automatically. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-foreground mb-1 block text-sm font-medium">
              Reason (Optional)
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Out of stock"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
