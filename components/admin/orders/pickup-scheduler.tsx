"use client"

import { Truck, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usePickupScheduler } from "@/hooks/use-pickup-scheduler"

/**
 * UI Component for scheduling Shippo pickups.
 * 100% logic-free; delegates entirely to usePickupScheduler hook.
 */
export function PickupScheduler() {
  const {
    pickupDate,
    startTime,
    endTime,
    isScheduling,
    schedulingError,
    schedulingSuccess,
    setPickupDate,
    setStartTime,
    setEndTime,
    handleSchedulePickup,
  } = usePickupScheduler()

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="gap-2" />}
      >
        <Truck className="h-4 w-4" />
        Schedule Pickup
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Shippo Pickup</DialogTitle>
          <DialogDescription>
            Schedule a carrier pickup for all confirmed and shipped orders.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pickup-date">Pickup Date</Label>
            <Input
              id="pickup-date"
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              disabled={isScheduling || schedulingSuccess}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isScheduling || schedulingSuccess}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isScheduling || schedulingSuccess}
              />
            </div>
          </div>

          {schedulingSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-xs font-medium sm:text-sm">
                Pickup scheduled successfully.
              </p>
            </div>
          )}

          {schedulingError && (
            <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs font-medium sm:text-sm">
                {schedulingError}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="default"
            onClick={handleSchedulePickup}
            disabled={isScheduling || schedulingSuccess}
            className="w-full sm:w-auto"
          >
            {isScheduling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Confirm Pickup"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
