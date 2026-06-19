"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react"
import { formatUSD } from "@/lib/utils/format"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import type { PlaceOrderResponse } from "@/lib/checkout/types"

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Square?: any
  }
}

interface StepPaymentProps {
  totalCents: number
  onBack: () => void
  onSubmit: (
    sourceId: string,
    turnstileToken: string,
  ) => Promise<PlaceOrderResponse>
}

export function StepPayment({
  totalCents,
  onBack,
  onSubmit,
}: StepPaymentProps) {
  const cardContainerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRef = useRef<any>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Support both key names — older builds use NEXT_PUBLIC_SQUARE_APP_ID
  const appId =
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ??
    process.env.NEXT_PUBLIC_SQUARE_APP_ID ??
    ""
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? ""
  const isTest = process.env.NEXT_PUBLIC_PAYMENT_MODE === "test"

  // ── Load Square Web Payments SDK ───────────────────────────────────────────
  async function initCard() {
    if (!window.Square || !cardContainerRef.current) return

    if (!appId || !locationId) {
      setSdkError(
        "Square credentials are missing. " +
          "Set NEXT_PUBLIC_SQUARE_APPLICATION_ID and NEXT_PUBLIC_SQUARE_LOCATION_ID in .env.local and restart the server.",
      )
      return
    }

    try {
      const payments = window.Square.payments(appId, locationId)
      const card = await payments.card()
      await card.attach(cardContainerRef.current)
      cardRef.current = card
      setSdkReady(true)
    } catch (err) {
      setSdkError("Payment form could not be loaded. Please refresh.")
      console.error("[step-payment] Square card attach error:", err)
    }
  }

  useEffect(() => {
    // Production credentials require the production SDK URL.
    // NEXT_PUBLIC_PAYMENT_MODE=test skips the real charge on the server.
    const src = "https://web.squarecdn.com/v1/square.js"

    if (window.Square) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      initCard()
      return
    }

    const script = document.createElement("script")
    script.src = src
    script.onload = () => initCard()
    script.onerror = () => setSdkError("Failed to load Square payment SDK.")
    document.head.appendChild(script)
    return () => {
      /* cleanup not needed — script persists */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePlace() {
    if (!cardRef.current || !turnstileToken) return
    setSubmitting(true)
    setPaymentError(null)

    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== "OK") {
        setPaymentError(
          result.errors?.[0]?.message ??
            "Card error — please check your details.",
        )
        return
      }

      const response = await onSubmit(result.token, turnstileToken)
      if (!response.ok) {
        setPaymentError(response.error ?? "Payment failed. Please try again.")
      }
      // On success, parent (CheckoutClient) handles redirect
    } catch (err) {
      setPaymentError("Unexpected error. Please try again.")
      console.error("[step-payment] submit error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-foreground text-lg font-semibold">Payment</h2>

      {isTest && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-400">
          Test mode — no charge will occur. Use any valid card format to
          complete checkout.
        </div>
      )}

      {sdkError ? (
        <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
          {sdkError}
        </p>
      ) : (
        <div
          ref={cardContainerRef}
          className={`border-border bg-muted/20 min-h-[100px] rounded-lg border p-4 transition-opacity ${sdkReady ? "opacity-100" : "opacity-50"}`}
        />
      )}

      {!sdkReady && !sdkError && (
        <p className="text-muted-foreground text-xs">
          Loading secure payment form…
        </p>
      )}

      <TurnstileWidget onVerify={setTurnstileToken} />

      {paymentError && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
          {paymentError}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="border-border text-foreground hover:bg-muted flex h-12 items-center gap-2 rounded-md border px-5 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back
        </button>
        <button
          type="button"
          onClick={handlePlace}
          disabled={!sdkReady || !turnstileToken || submitting}
          className="bg-foreground text-background flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Lock className="h-4 w-4" strokeWidth={1.75} />
          {submitting
            ? "Processing…"
            : `Place Order — ${formatUSD(totalCents / 100)}`}
        </button>
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        Your payment info is tokenized by Square — we never see your card
        number.
      </div>
    </div>
  )
}
