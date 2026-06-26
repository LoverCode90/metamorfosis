"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react"
import { formatUSD } from "@/lib/utils/format"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { SavedCard } from "../saved-card"
import { useSquarePayment } from "@/hooks/use-square-payment"
import type { PlaceOrderResponse } from "@/lib/checkout/types"

interface StepPaymentProps {
  totalCents: number
  surchargeCents: number
  savedCardId?: string | null
  onBack: () => void
  onSubmit: (
    sourceId: string,
    turnstileToken: string,
    surchargeAccepted: boolean,
    saveCardConsented: boolean,
  ) => Promise<PlaceOrderResponse>
}

export function StepPayment({
  totalCents,
  surchargeCents,
  savedCardId,
  onBack,
  onSubmit,
}: StepPaymentProps) {
  const [turnstileToken, setTurnstileToken] = useState("")
  const [surchargeAccepted, setSurchargeAccepted] = useState(false)
  const [saveCard, setSaveCard] = useState(true)

  const {
    cardContainerRef,
    sdkReady,
    sdkError,
    paymentError,
    submitting,
    useSavedCard,
    setUseSavedCard,
    handlePlace,
  } = useSquarePayment({ savedCardId, onSubmit })

  const router = useRouter()
  const isTest = process.env.NEXT_PUBLIC_PAYMENT_MODE === "test"

  return (
    <div className="space-y-6">
      <h2 className="text-foreground text-lg font-semibold">Payment</h2>

      {isTest && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-400">
          Test mode — no charge will occur. Use any valid card format to
          complete checkout.
        </div>
      )}

      {useSavedCard && savedCardId ? (
        <div className="space-y-4">
          <p className="text-foreground text-sm font-medium">
            Pay with saved card
          </p>
          <SavedCard
            cardId={savedCardId}
            buttonLabel="Use a different card"
            onUpdateCard={() => router.push("/profile/cards?from=payment")}
          />
        </div>
      ) : (
        <>
          {sdkError ? (
            <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
              {sdkError}
            </p>
          ) : (
            <div
              ref={cardContainerRef}
              className={`border-border bg-muted/20 min-h-25 w-full overflow-hidden rounded-lg border p-4 transition-opacity ${sdkReady ? "opacity-100" : "opacity-50"}`}
            />
          )}

          {!sdkReady && !sdkError && (
            <p className="text-muted-foreground text-xs">
              Loading secure payment form…
            </p>
          )}
        </>
      )}

      <TurnstileWidget onVerify={setTurnstileToken} />

      {paymentError && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
          {paymentError}
        </p>
      )}

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={surchargeAccepted}
          onChange={(e) => setSurchargeAccepted(e.target.checked)}
          className="border-border mt-0.5 h-4 w-4 shrink-0 rounded"
        />
        <span className="text-muted-foreground text-sm">
          I understand a{" "}
          <span className="text-foreground font-medium">
            2.6% fee ({formatUSD(surchargeCents)})
          </span>{" "}
          will apply to this order.
        </span>
      </label>

      {!useSavedCard && (
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            className="border-border mt-0.5 h-4 w-4 shrink-0 rounded"
          />
          <span className="text-muted-foreground text-sm">
            Save card for future purchases
          </span>
        </label>
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
          onClick={() =>
            handlePlace(turnstileToken, surchargeAccepted, saveCard)
          }
          disabled={
            (!useSavedCard && !sdkReady) ||
            !turnstileToken ||
            submitting ||
            !surchargeAccepted
          }
          className="bg-foreground text-background flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Lock className="h-4 w-4" strokeWidth={1.75} />
          {submitting
            ? "Processing…"
            : `Place Order — ${formatUSD(totalCents)}`}
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
