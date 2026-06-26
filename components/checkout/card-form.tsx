"use client"

import { Calendar, CreditCard, Lock, User } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FloatingField } from "./floating-field"

export function CardForm() {
  return (
    <div className="space-y-6">
      <FloatingField
        id="card-holder"
        label="Cardholder name"
        icon={User}
        autoComplete="cc-name"
      />
      <FloatingField
        id="card-number"
        label="Card number"
        icon={CreditCard}
        inputMode="numeric"
        autoComplete="cc-number"
      />
      <div className="grid grid-cols-2 gap-5">
        <FloatingField
          id="card-expiry"
          label="MM / YY"
          icon={Calendar}
          inputMode="numeric"
          autoComplete="cc-exp"
        />
        <FloatingField
          id="card-cvc"
          label="CVC"
          icon={Lock}
          inputMode="numeric"
          autoComplete="cc-csc"
        />
      </div>

      <div className="flex items-center gap-2.5 pt-1">
        <Checkbox id="save-card" defaultChecked />
        <Label
          htmlFor="save-card"
          className="text-muted-foreground text-sm font-normal"
        >
          Save this card for seamless future purchases
        </Label>
      </div>
    </div>
  )
}
