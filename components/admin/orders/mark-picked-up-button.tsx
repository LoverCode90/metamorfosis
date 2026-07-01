"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

interface MarkPickedUpButtonProps {
  orderId: string
}

export function MarkPickedUpButton({ orderId }: MarkPickedUpButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMarkPickedUp = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/mark-picked-up`, {
        method: "POST",
      })
      const data = await res.json()
      if (data.ok) {
        router.refresh()
      } else {
        alert(data.error || "Failed to mark as picked up")
      }
    } catch {
      alert("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleMarkPickedUp} disabled={loading}>
      {loading ? "Saving…" : "Mark picked up"}
    </Button>
  )
}
