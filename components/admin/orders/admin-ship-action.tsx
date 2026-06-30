"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Truck, Printer } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"

interface AdminShipActionProps {
  orderId: string
  shippingMethod?: string | null
  carrier?: string | null
}

/** Generates a Shippo shipping label for an order, or provides a packing slip link for pickups. */
export function AdminShipAction({
  orderId,
  shippingMethod,
  carrier,
}: AdminShipActionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isPickup =
    shippingMethod?.toLowerCase().includes("pickup") ||
    carrier?.toLowerCase().includes("pickup")

  if (isPickup) {
    return (
      <Link
        href={`/admin/orders/${orderId}/packing-slip`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "default" })}
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Packing Slip
      </Link>
    )
  }

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
