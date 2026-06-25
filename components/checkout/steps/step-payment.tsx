"use client"

import { useState } from "react"
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
  onSubmit: (sid: string, tkn: string, sur: boolean, save: boolean) => Promise<PlaceOrderResponse>
}

export function StepPayment({ totalCents, surchargeCents, savedCardId, onBack, onSubmit }: StepPaymentProps) {
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

  const isTest = process.env.NEXT_PUBLIC_PAYMENT_MODE === "test"

  return (
    <div className="space-y-6">
      <h2 className="text-foreground text-lg font-semibold">Payment</h2>

      {isTest && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-400">
          Test mode — no charge will occur.
        </div>
      )}

      {useSavedCard ? (
        <div className="space-y-4">
          <p className="text-foreground text-sm font-medium">Pay with saved card</p>
          <SavedCard isValid buttonLabel="Use a different card" onUpdateCard={() => setUseSavedCard(false)} />
        </div>
      ) : (
        <div className="space-y-2">
          {sdkError ? (
            <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">{sdkError}</p>
          ) : (
            <div ref={cardContainerRef} className={`border-border bg-muted/20 min-h-25 w-full rounded-lg border p-4 ${sdkReady ? "opacity-100" : "opacity-50"}`} />
          )}
          {!sdkReady && !sdkError && <p className="text-muted-foreground text-xs">Loading secure payment form…</p>}
        </div>
      )}

      <TurnstileWidget onVerify={setTurnstileToken} />
      {paymentError && <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">{paymentError}</p>}

      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={surchargeAccepted} onChange={(e) => setSurchargeAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 rounded" />
        <span className="text-muted-foreground text-sm">
          I understand a <span className="text-foreground font-medium">2.6% fee ({formatUSD(surchargeCents)})</span> will apply.
        </span>
      </label>

      {!useSavedCard && (
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="mt-0.5 h-4 w-4 rounded" />
          <span className="text-muted-foreground text-sm">Save card for future purchases</span>
        </label>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} disabled={submitting} className="border border-border flex h-12 items-center gap-2 rounded-md px-5 text-sm font-medium"><ArrowLeft className="h-4 w-4" />Back</button>
        <button type="button" onClick={() => handlePlace(turnstileToken, surchargeAccepted, saveCard)} disabled={(!useSavedCard && !sdkReady) || !turnstileToken || submitting || !surchargeAccepted} className="bg-foreground text-background flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-sm font-semibold disabled:opacity-50"><Lock className="h-4 w-4" />{submitting ? "Processing…" : `Place Order — ${formatUSD(totalCents)}`}</button>
      </div>
    </div>
  )
}
