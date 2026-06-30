"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

interface UseAdminShipLabelOptions {
  orderId: string
  trackingNumber?: string | null
  carrier?: string | null
  shippoTransactionId?: string | null
}

interface LabelApiResponse {
  error?: string
  details?: string
  trackingNumber?: string
  carrier?: string
  shippoTestMode?: boolean
}

function buildApiErrorMessage(
  responseBody: LabelApiResponse,
  fallbackMessage: string,
): string {
  let errorMessage = responseBody.error || fallbackMessage
  if (responseBody.details) {
    errorMessage = `${errorMessage}: ${responseBody.details}`
  }
  return errorMessage
}

/** State and API calls for generating or reprinting Shippo labels. */
export function useAdminShipLabel({
  orderId,
  trackingNumber,
  carrier,
  shippoTransactionId,
}: UseAdminShipLabelOptions) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [labelDialogOpen, setLabelDialogOpen] = useState(false)
  const [labelTrackingNumber, setLabelTrackingNumber] = useState<string | null>(
    trackingNumber ?? null,
  )
  const [labelCarrier, setLabelCarrier] = useState<string | null>(
    carrier ?? null,
  )
  const [shippoTestMode, setShippoTestMode] = useState(false)

  const hasExistingLabel = Boolean(trackingNumber && shippoTransactionId)

  const openLabelDialog = useCallback(
    (responseBody: LabelApiResponse) => {
      setLabelTrackingNumber(responseBody.trackingNumber ?? null)
      setLabelCarrier(responseBody.carrier ?? carrier ?? null)
      setShippoTestMode(Boolean(responseBody.shippoTestMode))
      setLabelDialogOpen(true)
    },
    [carrier],
  )

  const generateLabel = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
      })
      const responseBody = (await response
        .json()
        .catch(() => ({}))) as LabelApiResponse

      if (!response.ok) {
        throw new Error(
          buildApiErrorMessage(responseBody, "Failed to generate label"),
        )
      }

      openLabelDialog(responseBody)
      router.refresh()
    } catch (requestError: unknown) {
      setErrorMessage(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong",
      )
    } finally {
      setIsLoading(false)
    }
  }, [openLabelDialog, orderId, router])

  const reprintLabel = useCallback(async () => {
    if (!shippoTransactionId) return
    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/label`)
      const responseBody = (await response
        .json()
        .catch(() => ({}))) as LabelApiResponse

      if (!response.ok) {
        throw new Error(
          buildApiErrorMessage(responseBody, "Failed to fetch label"),
        )
      }

      setLabelTrackingNumber(
        responseBody.trackingNumber ?? trackingNumber ?? null,
      )
      setLabelCarrier(responseBody.carrier ?? carrier ?? null)
      setShippoTestMode(Boolean(responseBody.shippoTestMode))
      setLabelDialogOpen(true)
    } catch (requestError: unknown) {
      setErrorMessage(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong",
      )
    } finally {
      setIsLoading(false)
    }
  }, [carrier, orderId, shippoTransactionId, trackingNumber])

  return {
    isLoading,
    errorMessage,
    labelDialogOpen,
    setLabelDialogOpen,
    labelTrackingNumber,
    labelCarrier,
    shippoTestMode,
    hasExistingLabel,
    generateLabel,
    reprintLabel,
  }
}
