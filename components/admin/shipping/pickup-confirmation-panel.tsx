"use client"

import { CheckCircle2 } from "lucide-react"

import type { SchedulePickupsResponse } from "@/lib/admin/carrier-pickup-types"
import { CARRIER_PICKUP_SLOTS } from "@/lib/admin/pickup-slots"
import { formatPacificDateTime } from "@/lib/admin/pacific-datetime"

interface PickupConfirmationPanelProps {
  result: SchedulePickupsResponse
}

/** Shows Shippo confirmation details after a successful schedule. */
export function PickupConfirmationPanel({
  result,
}: PickupConfirmationPanelProps) {
  const slot = CARRIER_PICKUP_SLOTS[result.slotKey]

  return (
    <div className="space-y-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
        <div>
          <p className="text-foreground text-sm font-semibold">
            Pickup scheduled for {result.pickupDate}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {slot.description}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {result.results.map((entry) => (
          <div
            key={entry.pickupCarrier}
            className="bg-card border-border/60 rounded-lg border p-3 text-sm"
          >
            <p className="text-foreground font-medium">
              {entry.carrierLabel} · {entry.orderCount} package
              {entry.orderCount === 1 ? "" : "s"}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Status: <span className="text-foreground">{entry.status}</span>
            </p>
            {entry.confirmationCode && (
              <p className="text-muted-foreground mt-1 text-xs">
                Confirmation code:{" "}
                <span className="text-foreground font-mono">
                  {entry.confirmationCode}
                </span>
              </p>
            )}
            {entry.confirmedStartTime && entry.confirmedEndTime && (
              <p className="text-muted-foreground mt-1 text-xs">
                Confirmed window:{" "}
                {formatPacificDateTime(entry.confirmedStartTime)} –{" "}
                {formatPacificDateTime(entry.confirmedEndTime)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
