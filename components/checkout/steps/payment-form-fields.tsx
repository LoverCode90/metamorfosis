"use client"

import type { RefObject } from "react"
import Link from "next/link"
import { CreditCard } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import type { SavedCardMeta } from "@/components/checkout/steps/step-payment"

interface PaymentFormFieldsProps {
  useSavedCard: boolean
  savedCard?: SavedCardMeta | null
  cardExpired: boolean
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
}

export function PaymentFormFields({
  useSavedCard,
  savedCard,
  cardExpired,
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
}: PaymentFormFieldsProps) {
  return (
    <>
      {useSavedCard && savedCard ? (
        <div className="space-y-3">
          <p className="text-foreground text-sm font-medium">
            Pay with saved card
          </p>
          <div className="border-border bg-muted/10 flex items-center gap-3 rounded-lg border p-4">
            <div className="bg-foreground/5 flex h-10 w-14 items-center justify-center rounded border border-white/10 font-mono text-xs">
              <CreditCard className="mr-1 h-3.5 w-3.5" /> CARD
            </div>
            <div className="flex-1">
              <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                {savedCard.brand ? `${savedCard.brand} · ` : ""}Card ending in{" "}
                {savedCard.last_four}
                {cardExpired && <Badge variant="destructive">Expired</Badge>}
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                Expires {String(savedCard.exp_month).padStart(2, "0")}/
                {savedCard.exp_year}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            To change your card, visit{" "}
            <Link
              href="/profile/cards"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Payment Methods
            </Link>{" "}
            in your profile.
          </p>
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
                "border-border min-h-25 w-full overflow-hidden rounded-lg border bg-[#070709] p-4 transition-opacity",
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
