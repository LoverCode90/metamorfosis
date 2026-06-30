"use client"

import { useCallback, useState } from "react"
import { addDays, format } from "date-fns"

import type {
  PickupScheduleData,
  SchedulePickupsResponse,
} from "@/lib/admin/carrier-pickup-types"
import type { CarrierPickupSlotKey } from "@/lib/admin/pickup-slots"

interface UseCarrierPickupSchedulerArgs {
  initialData: PickupScheduleData
}

interface UseCarrierPickupSchedulerResult {
  data: PickupScheduleData
  pickupDate: string
  instructions: string
  isRefreshing: boolean
  isScheduling: boolean
  error: string | null
  scheduleResult: SchedulePickupsResponse | null
  setPickupDate: (value: string) => void
  setInstructions: (value: string) => void
  refresh: () => Promise<void>
  schedulePickup: (slotKey: CarrierPickupSlotKey) => Promise<void>
}

async function fetchPickupScheduleData(): Promise<PickupScheduleData> {
  const response = await fetch("/api/admin/shipping/pickups")
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load pickup data")
  }
  return payload as PickupScheduleData
}

export function useCarrierPickupScheduler({
  initialData,
}: UseCarrierPickupSchedulerArgs): UseCarrierPickupSchedulerResult {
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd")

  const [data, setData] = useState(initialData)
  const [pickupDate, setPickupDate] = useState(tomorrow)
  const [instructions, setInstructions] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scheduleResult, setScheduleResult] =
    useState<SchedulePickupsResponse | null>(null)

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      setData(await fetchPickupScheduleData())
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load pickup data"
      setError(message)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const schedulePickup = useCallback(
    async (slotKey: CarrierPickupSlotKey) => {
      setIsScheduling(true)
      setError(null)
      setScheduleResult(null)
      try {
        const response = await fetch("/api/admin/shipping/pickups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotKey, pickupDate, instructions }),
        })
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to schedule pickup")
        }
        setScheduleResult(payload as SchedulePickupsResponse)
        setData(await fetchPickupScheduleData())
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to schedule pickup"
        setError(message)
      } finally {
        setIsScheduling(false)
      }
    },
    [instructions, pickupDate],
  )

  return {
    data,
    pickupDate,
    instructions,
    isRefreshing,
    isScheduling,
    error,
    scheduleResult,
    setPickupDate,
    setInstructions,
    refresh,
    schedulePickup,
  }
}
