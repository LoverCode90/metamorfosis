"use client"

import { useState, useCallback } from "react"
import { addDays, format } from "date-fns"

interface UsePickupSchedulerResult {
  pickupDate: string
  startTime: string
  endTime: string
  isScheduling: boolean
  schedulingError: string | null
  schedulingSuccess: boolean
  setPickupDate: (date: string) => void
  setStartTime: (time: string) => void
  setEndTime: (time: string) => void
  handleSchedulePickup: () => Promise<void>
}

/**
 * Custom hook to manage the state and API call for scheduling a Shippo pickup.
 * Handles the POST /api/admin/shipping/pickups request and form state.
 */
export function usePickupScheduler(): UsePickupSchedulerResult {
  // Default to tomorrow
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd")

  const [pickupDate, setPickupDate] = useState<string>(tomorrowStr)
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endTime, setEndTime] = useState<string>("17:00")

  const [isScheduling, setIsScheduling] = useState<boolean>(false)
  const [schedulingError, setSchedulingError] = useState<string | null>(null)
  const [schedulingSuccess, setSchedulingSuccess] = useState<boolean>(false)

  const handleSchedulePickup = useCallback(async () => {
    setIsScheduling(true)
    setSchedulingError(null)
    setSchedulingSuccess(false)

    // Build ISO 8601 strings from the selected date and time in local timezone
    const startDate = new Date(`${pickupDate}T${startTime}`)
    const endDate = new Date(`${pickupDate}T${endTime}`)

    const requestedStartTime = startDate.toISOString()
    const requestedEndTime = endDate.toISOString()

    try {
      const response = await fetch("/api/admin/shipping/pickups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestedStartTime, requestedEndTime }),
      })

      const responseData = await response.json()

      if (!response.ok || !responseData.success) {
        const errorMessage = responseData.error || "Failed to schedule pickup."
        setSchedulingError(errorMessage)
        return
      }

      setSchedulingSuccess(true)
    } catch (error) {
      const unexpectedError =
        error instanceof Error ? error.message : "An unexpected error occurred."
      setSchedulingError(unexpectedError)
    } finally {
      setIsScheduling(false)
    }
  }, [pickupDate, startTime, endTime])

  return {
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
  }
}
