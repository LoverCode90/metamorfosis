"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import type { PaymentVariant } from "@/lib/checkout"
import { Separator } from "@/components/ui/separator"
import { CardForm } from "./card-form"
import { GooglePayButton } from "./google-pay-button"
import { SavedCard } from "./saved-card"
import { ShippingLocked } from "./shipping-locked"

interface PaymentSectionProps {
  variant: PaymentVariant
}

export function PaymentSection({ variant }: PaymentSectionProps) {
  // When the user clicks "Update card to continue" inside the expired state,
  // we gracefully unmount the SavedCard and render a fresh CardForm.
  const [updatingCard, setUpdatingCard] = useState(false)

  // Reset the local override whenever the outer variant changes.
  const isExpired = variant === "expired" && !updatingCard

  function handleUpdateCard() {
    setUpdatingCard(true)
  }

  // Keep updatingCard in sync when the demo toggle switches away from expired.
  // Using a key-based reset below handles this instead.
  return (
    <section className="space-y-8" key={variant}>
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-foreground" strokeWidth={2} />
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Secure Payment
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          All transactions are encrypted and processed securely.
        </p>
      </header>

      {/* Single adaptive digital wallet slot */}
      <GooglePayButton disabled={isExpired} />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          or pay with card
        </span>
        <Separator className="flex-1" />
      </div>

      {isExpired ? (
        <SavedCard onUpdateCard={handleUpdateCard} />
      ) : (
        <CardForm />
      )}

      <ShippingLocked />
    </section>
  )
}
