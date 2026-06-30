"use client"

import { AlertCircle, Loader2 } from "lucide-react"

import { PickupConfirmationPanel } from "@/components/admin/shipping/pickup-confirmation-panel"
import { PickupEligibleSummary } from "@/components/admin/shipping/pickup-eligible-summary"
import { PickupHistoryList } from "@/components/admin/shipping/pickup-history-list"
import { PickupInstructionsField } from "@/components/admin/shipping/pickup-instructions-field"
import { PickupSlotButtons } from "@/components/admin/shipping/pickup-slot-buttons"
import { AdminSurfaceCard } from "@/components/admin/ui/admin-surface-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PickupScheduleData } from "@/lib/admin/carrier-pickup-types"
import { useCarrierPickupScheduler } from "@/hooks/use-carrier-pickup-scheduler"
import { PICKUP_ADDRESS } from "@/lib/checkout/pickup"

interface PickupScheduleViewProps {
  initialData: PickupScheduleData
}

/** Admin client view for scheduling USPS / DHL Express pickups. */
export function PickupScheduleView({ initialData }: PickupScheduleViewProps) {
  const {
    data,
    pickupDate,
    instructions,
    isRefreshing,
    isScheduling,
    error,
    scheduleResult,
    setPickupDate,
    setInstructions,
    schedulePickup,
  } = useCarrierPickupScheduler({ initialData })

  const canSchedule = data.eligibleTotal > 0 && !isScheduling && !isRefreshing

  return (
    <div className="space-y-6">
      <AdminSurfaceCard
        title="Schedule carrier pickup"
        description={`Packages are picked up at ${PICKUP_ADDRESS}. Choose a window and optional instructions for the driver.`}
      >
        {isRefreshing ? (
          <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Refreshing…
          </div>
        ) : null}

        <div className="space-y-6">
          <PickupEligibleSummary
            total={data.eligibleTotal}
            uspsCount={data.eligibleCounts.usps}
            dhlCount={data.eligibleCounts.dhl_express}
            orders={data.eligibleOrders}
          />

          <div className="space-y-2">
            <Label htmlFor="pickup-date">Pickup date</Label>
            <Input
              id="pickup-date"
              type="date"
              value={pickupDate}
              disabled={isScheduling}
              onChange={(event) => setPickupDate(event.target.value)}
              className="max-w-xs"
            />
          </div>

          <PickupInstructionsField
            value={instructions}
            disabled={isScheduling}
            onChange={setInstructions}
          />

          <PickupSlotButtons
            disabled={!canSchedule}
            isScheduling={isScheduling}
            onSchedule={schedulePickup}
          />
        </div>

        {error && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {scheduleResult && (
          <div className="mt-4">
            <PickupConfirmationPanel result={scheduleResult} />
          </div>
        )}
      </AdminSurfaceCard>

      <AdminSurfaceCard
        title="Recent pickups"
        description="Saved confirmations from Shippo."
      >
        <PickupHistoryList records={data.history} />
      </AdminSurfaceCard>
    </div>
  )
}
