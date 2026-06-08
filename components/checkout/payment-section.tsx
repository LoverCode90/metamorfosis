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
  const isExpired = variant === "expired"

  return (
    <section className="space-y-8">
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

      {isExpired ? <SavedCard /> : <CardForm />}

      <ShippingLocked />
    </section>
  )
}
