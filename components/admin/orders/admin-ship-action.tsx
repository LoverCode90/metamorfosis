"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Generates a Shippo shipping label for an order, then refreshes the page. */
export function AdminShipAction({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function generateLabel() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to generate label")
      if (data.labelUrl) window.open(data.labelUrl, "_blank", "noopener")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={generateLabel} disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Truck className="mr-2 h-4 w-4" />
        )}
        Generate Shipping Label
      </Button>
      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
    </div>
  )
}
