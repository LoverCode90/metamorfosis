"use client"

import { format } from "date-fns"
import { Loader2 } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CARRIER_PICKUP_SLOTS,
  type CarrierPickupSlotKey,
} from "@/lib/admin/pickup-slots"
import { cn } from "@/lib/utils"

interface PickupScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pickupDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
  slotKey: CarrierPickupSlotKey | null
  onSlotChange: (key: CarrierPickupSlotKey) => void
  instructions: string
  onInstructionsChange: (value: string) => void
  selectedCount: number
  onContinue: () => void
  isSubmitting?: boolean
}

export function PickupScheduleDialog({
  open,
  onOpenChange,
  pickupDate,
  onDateChange,
  slotKey,
  onSlotChange,
  instructions,
  onInstructionsChange,
  selectedCount,
  onContinue,
  isSubmitting = false,
}: PickupScheduleDialogProps) {
  const slots = Object.values(CARRIER_PICKUP_SLOTS)
  const canContinue = Boolean(pickupDate && slotKey)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle>Schedule pickup</DialogTitle>
          <DialogDescription>
            {selectedCount} package{selectedCount === 1 ? "" : "s"} selected.
            Choose a date and time window.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="border-border flex justify-center rounded-xl border p-2">
            <Calendar
              mode="single"
              selected={pickupDate}
              onSelect={onDateChange}
              disabled={{ before: new Date() }}
            />
          </div>

          {pickupDate && (
            <p className="text-muted-foreground text-center text-xs">
              {format(pickupDate, "EEEE, MMMM d, yyyy")}
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {slots.map((slot) => (
              <button
                key={slot.slotKey}
                type="button"
                onClick={() => onSlotChange(slot.slotKey)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  slotKey === slot.slotKey
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-border hover:border-violet-500/40",
                )}
              >
                <p className="text-foreground text-sm font-semibold">
                  {slot.label}
                </p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {slot.description}
                </p>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup-modal-instructions">
              Instructions for carrier (optional)
            </Label>
            <Textarea
              id="pickup-modal-instructions"
              value={instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Ring bell at front door…"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canContinue || isSubmitting}
            onClick={onContinue}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Scheduling…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
