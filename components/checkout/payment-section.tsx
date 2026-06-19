"use client"

import { Lock } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { CardForm } from "./card-form"
import { GooglePayButton } from "./google-pay-button"
import { ShippingLocked } from "./shipping-locked"

export function PaymentSection() {
  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Lock className="text-foreground h-4 w-4" strokeWidth={2} />
          <h1 className="text-foreground text-lg font-semibold tracking-tight">
            Secure Payment
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          All transactions are encrypted and processed securely.
        </p>
      </header>

      <GooglePayButton />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs tracking-wider uppercase">
          or pay with card
        </span>
        <Separator className="flex-1" />
      </div>

      <CardForm />
      <ShippingLocked />
    </section>
  )
}
