"use client"

import { useState } from "react"
import { AlertCircle, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShippingRateOption } from "@/components/checkout/steps/shipping-rate-option"
import { useShippingRates } from "@/hooks/use-shipping-rates"
import type {
  CheckoutAddress,
  ShippingMethod,
  ShippingRate,
} from "@/lib/checkout/types"

interface StepShippingProps {
  subtotalCents: number
  address: CheckoutAddress
  cartItems: { variationId: string; quantity: number }[]
  initialRates?: ShippingRate[] | null
  onRatesFetched?: (rates: ShippingRate[]) => void
  onContinue: (method: ShippingMethod, amountCents: number) => void
  onBack: () => void
}

/** Checkout step 2: live shipping-rate selection. */
export function StepShipping({
  subtotalCents,
  address,
  cartItems,
  initialRates,
  onRatesFetched,
  onContinue,
  onBack,
}: StepShippingProps) {
  const [selected, setSelected] = useState<ShippingMethod>("standard")
  const { rates, freeNote, oversizedMsg, loading } = useShippingRates({
    subtotalCents,
    address,
    items: cartItems,
    initialRates,
    onRatesFetched,
  })

  const selectedRate = rates.find((rate) => rate.method === selected)

  return (
    <div className="space-y-6">
      <h2 className="text-foreground text-lg font-semibold">Shipping</h2>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : oversizedMsg ? (
        <div className="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-lg border p-4">
          <AlertCircle
            className="text-destructive mt-0.5 h-4 w-4 shrink-0"
            strokeWidth={1.75}
          />
          <p className="text-foreground text-sm">{oversizedMsg}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rates.map((rate) => (
            <ShippingRateOption
              key={rate.method}
              rate={rate}
              selected={selected === rate.method}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      {freeNote && <p className="text-muted-foreground text-xs">{freeNote}</p>}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="h-12">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back
        </Button>
        <Button
          variant="accent"
          disabled={!selectedRate || !!oversizedMsg}
          onClick={() =>
            selectedRate && onContinue(selected, selectedRate.amountCents)
          }
          className="h-12 flex-1"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}
