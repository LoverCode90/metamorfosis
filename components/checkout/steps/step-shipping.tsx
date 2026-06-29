"use client"

import { AlertCircle, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShippingRateOption } from "@/components/checkout/steps/shipping-rate-option"
import { useShippingRates } from "@/hooks/use-shipping-rates"
import type { CheckoutAddress, LiveShippingRate } from "@/lib/checkout/types"

/** Free in-store pickup, always offered alongside live carrier rates. */
const PICKUP_RATE: LiveShippingRate = {
  carrier: "pickup",
  service_name: "Pick Up in Store — Ontario, CA",
  amount_cents: 0,
  estimated_days: null,
  shippo_rate_id: null,
}

/** Stable highlight key for a rate (pickup has no shippo_rate_id). */
function rateKey(rate: LiveShippingRate): string {
  return rate.shippo_rate_id ?? "pickup"
}

interface StepShippingProps {
  subtotalCents: number
  address: CheckoutAddress
  cartItems: { variationId: string; quantity: number }[]
  initialRates?: LiveShippingRate[] | null
  selectedRateKey: string | null
  onRatesFetched?: (rates: LiveShippingRate[]) => void
  onSelectRate: (rate: LiveShippingRate) => void
  onContinue: () => void
  onBack: () => void
}

/** Checkout step 2: live carrier-rate selection plus free in-store pickup. */
export function StepShipping({
  subtotalCents,
  address,
  cartItems,
  initialRates,
  selectedRateKey,
  onRatesFetched,
  onSelectRate,
  onContinue,
  onBack,
}: StepShippingProps) {
  const { rates, freeShipping, message, error, loading } = useShippingRates({
    subtotalCents,
    address,
    cartItems,
    initialRates,
    onRatesFetched,
  })

  const selectableRates = [...rates, PICKUP_RATE]
  const notice = error ?? message

  return (
    <div className="space-y-6">
      <h2 className="text-foreground text-lg font-semibold">Shipping</h2>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {notice && (
            <div className="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-lg border p-4">
              <AlertCircle
                className="text-destructive mt-0.5 h-4 w-4 shrink-0"
                strokeWidth={1.75}
              />
              <p className="text-foreground text-sm">{notice}</p>
            </div>
          )}
          {selectableRates.map((rate) => (
            <ShippingRateOption
              key={rateKey(rate)}
              rate={rate}
              selected={selectedRateKey === rateKey(rate)}
              freeShipping={freeShipping}
              onSelect={onSelectRate}
            />
          ))}
        </div>
      )}

      {freeShipping && rates.length > 0 && (
        <p className="text-muted-foreground text-xs">
          Your order qualifies for free shipping.
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="h-12">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back
        </Button>
        <Button
          variant="default"
          disabled={!selectedRateKey || loading}
          onClick={onContinue}
          className="h-12 flex-1"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}
