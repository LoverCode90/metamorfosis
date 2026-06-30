"use client"

import { memo } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CARRIER_PICKUP_SLOTS,
  type CarrierPickupSlotKey,
} from "@/lib/admin/pickup-slots"

interface PickupSlotButtonsProps {
  disabled: boolean
  isScheduling: boolean
  onSchedule: (slotKey: CarrierPickupSlotKey) => void
}

/** Two preset Pacific pickup windows offered to the admin. */
export function PickupSlotButtons({
  disabled,
  isScheduling,
  onSchedule,
}: PickupSlotButtonsProps) {
  const slots = Object.values(CARRIER_PICKUP_SLOTS)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {slots.map((slot) => (
        <PickupSlotButton
          key={slot.slotKey}
          slotKey={slot.slotKey}
          label={slot.label}
          description={slot.description}
          disabled={disabled || isScheduling}
          isScheduling={isScheduling}
          onSchedule={onSchedule}
        />
      ))}
    </div>
  )
}

interface PickupSlotButtonProps {
  slotKey: CarrierPickupSlotKey
  label: string
  description: string
  disabled: boolean
  isScheduling: boolean
  onSchedule: (slotKey: CarrierPickupSlotKey) => void
}

const PickupSlotButton = memo(function PickupSlotButton({
  slotKey,
  label,
  description,
  disabled,
  isScheduling,
  onSchedule,
}: PickupSlotButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={() => onSchedule(slotKey)}
      className="h-auto min-h-24 flex-col items-start gap-2 px-4 py-4 text-left whitespace-normal"
    >
      <span className="text-foreground text-sm font-semibold">{label}</span>
      <span className="text-muted-foreground text-xs leading-relaxed">
        {description}
      </span>
      {isScheduling && (
        <span className="text-muted-foreground inline-flex items-center gap-2 text-xs">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Scheduling…
        </span>
      )}
    </Button>
  )
})
