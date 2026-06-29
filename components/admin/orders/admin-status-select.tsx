"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/components/ui/native-select"

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
]

interface AdminStatusSelectProps {
  orderId: string
  current: string
}

/** Inline order-status updater. */
export function AdminStatusSelect({
  orderId,
  current,
}: AdminStatusSelectProps) {
  const router = useRouter()
  const [status, setStatus] = useState(current)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function save() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to update status")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <NativeSelect
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={loading}
          className="capitalize"
        >
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value} className="capitalize">
              {value}
            </option>
          ))}
        </NativeSelect>
        <Button
          onClick={save}
          disabled={loading || status === current}
          variant="outline"
        >
          {loading ? "Saving..." : "Update"}
        </Button>
      </div>
      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
    </div>
  )
}
