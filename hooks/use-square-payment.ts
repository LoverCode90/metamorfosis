import { useEffect, useRef, useState } from "react"
import type { PlaceOrderResponse } from "@/lib/checkout/types"

declare global {
  interface Window {
    Square?: any
  }
}

interface UseSquarePaymentOptions {
  savedCardId?: string | null
  onSubmit: (
    sourceId: string,
    turnstileToken: string,
    surchargeAccepted: boolean,
    saveCardConsented: boolean
  ) => Promise<PlaceOrderResponse>
}

export function useSquarePayment({ savedCardId, onSubmit }: UseSquarePaymentOptions) {
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<any>(null)

  const [sdkReady, setSdkReady] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Sync state during render phase to fix the cascading rendering warning
  const [useSavedCard, setUseSavedCard] = useState(!!savedCardId?.startsWith("ccof:"))
  const [prevSavedCardId, setPrevSavedCardId] = useState(savedCardId)

  if (savedCardId !== prevSavedCardId) {
    setPrevSavedCardId(savedCardId)
    if (savedCardId?.startsWith("ccof:")) {
      setUseSavedCard(true)
    }
  }

  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? process.env.NEXT_PUBLIC_SQUARE_APP_ID ?? ""
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? ""

  useEffect(() => {
    if (useSavedCard) return

    async function initCard() {
      if (!window.Square || !cardContainerRef.current) return
      if (!appId || !locationId) {
        setSdkError("Square credentials missing.")
        return
      }
      try {
        const payments = window.Square.payments(appId, locationId)
        const card = await payments.card({
          style: {
            input: { color: "#f4f5f8", backgroundColor: "#070709", fontSize: "16px" },
            "input::placeholder": { color: "#68686f" },
            ".input-container": { borderColor: "#28292b", borderRadius: "8px" },
            ".input-container.is-focus": { borderColor: "#4361ee" },
            ".input-container.is-error": { borderColor: "#f9667a" },
          }
        })
        await card.attach(cardContainerRef.current)
        cardRef.current = card
        setSdkReady(true)
      } catch (err) {
        setSdkError("Payment form failed to load.")
      }
    }

    if (window.Square) {
      initCard()
      return
    }

    const script = document.createElement("script")
    script.src = "https://web.squarecdn.com/v1/square.js"
    script.onload = initCard
    script.onerror = () => setSdkError("Failed to load Square SDK.")
    document.head.appendChild(script)
  }, [useSavedCard, appId, locationId])

  async function handlePlace(
    turnstileToken: string,
    surchargeAccepted: boolean,
    saveCard: boolean
  ) {
    if (!turnstileToken || (!useSavedCard && !cardRef.current)) return
    setSubmitting(true)
    setPaymentError(null)

    try {
      let sourceId = savedCardId && useSavedCard ? savedCardId : ""
      if (!useSavedCard) {
        const result = await cardRef.current.tokenize()
        if (result.status !== "OK") {
          setPaymentError(result.errors?.[0]?.message ?? "Card error.")
          return
        }
        sourceId = result.token
      }

      const res = await onSubmit(
        sourceId,
        turnstileToken,
        surchargeAccepted,
        useSavedCard ? false : saveCard
      )
      if (!res.ok) setPaymentError(res.error ?? "Payment failed.")
    } catch (err) {
      setPaymentError("Unexpected error.")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    cardContainerRef,
    sdkReady,
    sdkError,
    paymentError,
    submitting,
    useSavedCard,
    setUseSavedCard,
    handlePlace,
  }
}
