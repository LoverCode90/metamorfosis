"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PaymentFormFields } from "@/components/checkout/steps/payment-form-fields"
import { useSquarePayment } from "@/hooks/use-square-payment"
import { formatUSD } from "@/lib/utils/format"
import type { PlaceOrderResponse } from "@/lib/checkout/types"

export interface SavedCardMeta {
  square_card_id: string
  last_four: string
  brand: string | null
  exp_month: number
  exp_year: number
}

interface StepPaymentProps {
  totalCents: number
  surchargeCents: number
  savedCard?: SavedCardMeta | null
  onBack: () => void
  onSubmit: (
    sourceId: string,
    turnstileToken: string,
    surchargeAccepted: boolean,
    saveCardConsented: boolean,
  ) => Promise<PlaceOrderResponse>
}

/** Checkout step 3: card entry (or saved card), consents, and place order. */
export function StepPayment({
  totalCents,
  surchargeCents,
  savedCard,
  onBack,
  onSubmit,
}: StepPaymentProps) {
  const router = useRouter()
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
    handlePlace,
  } = useSquarePayment({
    savedCardId: savedCard?.square_card_id ?? null,
    onSubmit,
  })

  const isTest = process.env.NEXT_PUBLIC_PAYMENT_MODE === "test"
  const now = new Date()
  const cardExpired = savedCard
    ? savedCard.exp_year < now.getFullYear() ||
      (savedCard.exp_year === now.getFullYear() &&
        savedCard.exp_month < now.getMonth() + 1)
    : false

  const placeDisabled =
    (!useSavedCard && !sdkReady) ||
    !turnstileToken ||
    submitting ||
    !surchargeAccepted ||
    (useSavedCard && cardExpired)

  return (
    <div className="space-y-6">
      <h2 className="text-foreground text-lg font-semibold">Payment</h2>

      {isTest && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-400">
          Test mode — no charge will occur. Use any valid card format to
          complete checkout.
        </div>
      )}

      <PaymentFormFields
        useSavedCard={useSavedCard}
        savedCard={savedCard}
        cardContainerRef={cardContainerRef}
        sdkReady={sdkReady}
        sdkError={sdkError}
        paymentError={paymentError}
        surchargeCents={surchargeCents}
        surchargeAccepted={surchargeAccepted}
        onSurchargeAcceptedChange={setSurchargeAccepted}
        saveCard={saveCard}
        onSaveCardChange={setSaveCard}
        onTurnstileVerify={setTurnstileToken}
        onUpdateCard={() => router.push("/profile/cards?from=payment")}
      />

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={submitting}
          className="h-12"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back
        </Button>
        <Button
          onClick={() =>
            handlePlace(turnstileToken, surchargeAccepted, saveCard)
          }
          disabled={placeDisabled}
          className="h-12 flex-1"
        >
          <Lock className="h-4 w-4" strokeWidth={1.75} />
          {submitting
            ? "Processing…"
            : useSavedCard && cardExpired
              ? "Update card to continue"
              : `Place Order — ${formatUSD(totalCents)}`}
        </Button>
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        Your payment info is tokenized by Square — we never see your card
        number.
      </div>
    </div>
  )
}
