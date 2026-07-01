import {
  CARRIER_PICKUP_SLOTS,
  type CarrierPickupSlotKey,
} from "@/lib/admin/pickup-slots"
import { cn } from "@/lib/utils"

interface PickupTimeSlotChartProps {
  slotKey: CarrierPickupSlotKey | null
}

/** Visual Pacific pickup window for the active scheduled slot. */
export function PickupTimeSlotChart({ slotKey }: PickupTimeSlotChartProps) {
  if (!slotKey) return null

  const slot = CARRIER_PICKUP_SLOTS[slotKey]
  const isEvening = slotKey === "evening"

  return (
    <div className="border-border bg-card rounded-2xl border p-5">
      <p className="text-foreground mb-1 text-sm font-semibold">
        Pickup window — Pacific Time
      </p>
      <p className="text-muted-foreground mb-4 text-xs">{slot.description}</p>
      <div className="bg-muted/60 relative h-10 overflow-hidden rounded-lg">
        <div
          className={cn(
            "absolute top-1 bottom-1 rounded-md bg-violet-500/80",
            isEvening ? "left-[58%] w-[28%]" : "left-[8%] w-[72%]",
          )}
        />
        <div className="text-muted-foreground absolute inset-x-0 bottom-0 flex justify-between px-2 pb-1 text-[10px]">
          <span>{isEvening ? "12 PM" : "8 AM"}</span>
          <span>{isEvening ? "8 PM" : "8 PM"}</span>
        </div>
      </div>
      <p className="text-muted-foreground mt-2 text-center text-xs font-medium">
        {slot.label}
      </p>
    </div>
  )
}
