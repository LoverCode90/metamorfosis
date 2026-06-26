"use client"

import type { RefObject } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { SavedCard } from "@/components/checkout/saved-card"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import type { SavedCardMeta } from "@/components/checkout/steps/step-payment"

interface PaymentFormFieldsProps {
  useSavedCard: boolean
  savedCard?: SavedCardMeta | null
  cardContainerRef: RefObject<HTMLDivElement | null>
  sdkReady: boolean
  sdkError: string | null
  paymentError: string | null
  surchargeCents: number
  surchargeAccepted: boolean
  onSurchargeAcceptedChange: (value: boolean) => void
  saveCard: boolean
  onSaveCardChange: (value: boolean) => void
  onTurnstileVerify: (token: string) => void
  onUpdateCard: () => void
}

/** Payment method entry, Turnstile check, and consent checkboxes. */
export function PaymentFormFields({
  useSavedCard,
  savedCard,
  cardContainerRef,
  sdkReady,
  sdkError,
  paymentError,
  surchargeCents,
  surchargeAccepted,
  onSurchargeAcceptedChange,
  saveCard,
  onSaveCardChange,
  onTurnstileVerify,
  onUpdateCard,
}: PaymentFormFieldsProps) {
  return (
    <>
      {useSavedCard && savedCard ? (
        <div className="space-y-4">
          <p className="text-foreground text-sm font-medium">
            Pay with saved card
          </p>
          <SavedCard
            last_four={savedCard.last_four}
            brand={savedCard.brand}
            exp_month={savedCard.exp_month}
            exp_year={savedCard.exp_year}
            buttonLabel="Use a different card"
            onUpdateCard={onUpdateCard}
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
              className={cn(
                "border-border bg-muted/20 min-h-25 w-full overflow-hidden rounded-lg border p-4 transition-opacity",
                sdkReady ? "opacity-100" : "opacity-50",
              )}
            />
          )}
          {!sdkReady && !sdkError && (
            <p className="text-muted-foreground text-xs">
              Loading secure payment form…
            </p>
          )}
        </>
      )}

      <TurnstileWidget onVerify={onTurnstileVerify} />

      {paymentError && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
          {paymentError}
        </p>
      )}

      <label className="flex cursor-pointer items-start gap-3">
        <Checkbox
          checked={surchargeAccepted}
          onCheckedChange={(checked) =>
            onSurchargeAcceptedChange(checked === true)
          }
          className="mt-0.5"
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
          <Checkbox
            checked={saveCard}
            onCheckedChange={(checked) => onSaveCardChange(checked === true)}
            className="mt-0.5"
          />
          <span className="text-muted-foreground text-sm">
            Save card for future purchases
          </span>
        </label>
      )}
    </>
  )
}
