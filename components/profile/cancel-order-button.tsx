"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface CancelOrderButtonProps {
  orderId: string
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST"
      })
      const data = await res.json()
      
      if (data.ok) {
        alert("Order cancelled successfully and refund initiated.")
        router.refresh()
      } else {
        alert(data.error || "Failed to cancel order")
      }
    } catch (err) {
      alert("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
    >
      {loading ? "Cancelling..." : "Cancel Order"}
    </button>
  )
}
