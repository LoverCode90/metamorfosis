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
import { cn } from "@/lib/utils"

interface FulfillPickupButtonProps {
  orderId: string
  ticketLabel: string
  size?: "default" | "lg"
  className?: string
}

export function FulfillPickupButton({
  orderId,
  ticketLabel,
  size = "default",
  className,
}: FulfillPickupButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFulfill = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/mark-picked-up`, {
        method: "POST",
      })
      const data = await res.json()
      if (data.ok) {
        setOpen(false)
        router.refresh()
      } else {
        alert(data.error || "Could not save. Please try again.")
      }
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        size={size}
        onClick={() => setOpen(true)}
        disabled={loading}
        className={cn("h-auto min-h-11 py-3 text-base", className)}
      >
        Customer picked up order
      </Button>

      <Dialog open={open} onOpenChange={(next) => !loading && setOpen(next)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer has the order?</DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Only tap confirm if you already handed ticket{" "}
              <strong>{ticketLabel}</strong> to the customer in the store.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:flex-col">
            <Button
              size="lg"
              onClick={handleFulfill}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving…" : "Yes, customer has the order"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="w-full"
            >
              Not yet — go back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
