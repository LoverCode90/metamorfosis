"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Printer, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LabelPrintDialog } from "@/components/admin/orders/label-print-dialog"
import {
  PackingSlipPrint,
  type PackingSlipData,
} from "@/components/admin/orders/packing-slip-print"

interface AdminShipActionProps {
  orderId: string
  shippingMethod?: string | null
  carrier?: string | null
  trackingNumber?: string | null
  shippoTransactionId?: string | null
  packingSlip?: PackingSlipData | null
}

/** Generates a Shippo shipping label or prints a pickup packing slip in-page. */
export function AdminShipAction({
  orderId,
  shippingMethod,
  carrier,
  trackingNumber,
  shippoTransactionId,
  packingSlip,
}: AdminShipActionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [labelOpen, setLabelOpen] = useState(false)
  const [labelTracking, setLabelTracking] = useState<string | null>(
    trackingNumber ?? null,
  )
  const [labelCarrier, setLabelCarrier] = useState<string | null>(
    carrier ?? null,
  )
  const [shippoTestMode, setShippoTestMode] = useState(false)

  const isPickup =
    shippingMethod?.toLowerCase().includes("pickup") ||
    carrier?.toLowerCase().includes("pickup")

  if (isPickup && packingSlip) {
    return <PackingSlipPrint slip={packingSlip} />
  }

  async function generateLabel() {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        let errorMsg = data.error || "Failed to generate label"
        if (data.details) {
          errorMsg = `${errorMsg}: ${data.details}`
        }
        throw new Error(errorMsg)
      }

      setLabelTracking(data.trackingNumber ?? null)
      setLabelCarrier(data.carrier ?? carrier ?? null)
      setShippoTestMode(Boolean(data.shippoTestMode))
      setLabelOpen(true)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function reprintLabel() {
    if (!shippoTransactionId) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/label`)
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        let errorMsg = data.error || "Failed to fetch label"
        if (data.details) {
          errorMsg = `${errorMsg}: ${data.details}`
        }
        throw new Error(errorMsg)
      }

      setLabelTracking(data.trackingNumber ?? trackingNumber ?? null)
      setLabelCarrier(data.carrier ?? carrier ?? null)
      setShippoTestMode(Boolean(data.shippoTestMode))
      setLabelOpen(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (trackingNumber && shippoTransactionId) {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={reprintLabel}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Printer className="mr-2 h-4 w-4" />
          )}
          Reprint Label
        </Button>
        {error && (
          <p className="text-destructive text-sm font-medium">{error}</p>
        )}
        <LabelPrintDialog
          orderId={orderId}
          open={labelOpen}
          onOpenChange={setLabelOpen}
          trackingNumber={labelTracking}
          carrier={labelCarrier}
          shippoTestMode={shippoTestMode}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={generateLabel}
        disabled={loading}
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-4px_var(--primary)]"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Truck className="mr-2 h-4 w-4" />
        )}
        Generate Shipping Label
      </Button>
      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
      <LabelPrintDialog
        orderId={orderId}
        open={labelOpen}
        onOpenChange={setLabelOpen}
        trackingNumber={labelTracking}
        carrier={labelCarrier}
        shippoTestMode={shippoTestMode}
      />
    </div>
  )
}
