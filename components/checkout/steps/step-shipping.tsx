"use client"

import { useEffect, useState } from "react"
import { AlertCircle, ArrowLeft, Check } from "lucide-react"
import type {
  ShippingMethod,
  ShippingRate,
  CheckoutAddress,
} from "@/lib/checkout/types"
import { cn } from "@/lib/utils"

interface StepShippingProps {
  subtotalCents: number
  address: CheckoutAddress
  cartItems: { variationId: string; quantity: number }[]
  initialRates?: ShippingRate[] | null
  onRatesFetched?: (rates: ShippingRate[]) => void
  onContinue: (method: ShippingMethod, amountCents: number) => void
  onBack: () => void
}

export function StepShipping({
  subtotalCents,
  address,
  cartItems,
  initialRates,
  onRatesFetched,
  onContinue,
  onBack,
}: StepShippingProps) {
  const [rates, setRates] = useState<ShippingRate[]>(initialRates ?? [])
  const [freeNote, setFreeNote] = useState<string | undefined>()
  const [oversizedMsg, setOversizedMsg] = useState<string | undefined>()
  const [selected, setSelected] = useState<ShippingMethod>("standard")
  const [loading, setLoading] = useState(!initialRates)

  useEffect(() => {
    if (initialRates) return

    let cancelled = false
    fetch("/api/checkout/shipping-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtotalCents, address, items: cartItems }),
    })
      .then((r) => r.json())
      .then(({ rates: r, freeThresholdNote, oversized, message }) => {
        if (cancelled) return
        if (oversized) {
          setOversizedMsg(message as string)
          setRates([])
        } else {
          setRates(r ?? [])
          setFreeNote(freeThresholdNote)
          if (r && onRatesFetched) onRatesFetched(r)
        }
        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotalCents])

  const selectedRate = rates.find((r) => r.method === selected)

  return (
    <div className="space-y-6">
      <h2 className="text-foreground text-lg font-semibold">Shipping</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
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
            <button
              key={rate.method}
              type="button"
              onClick={() => setSelected(rate.method)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-4 py-4 text-left transition-colors",
                selected === rate.method
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
                    selected === rate.method
                      ? "border-foreground bg-foreground"
                      : "border-border",
                  )}
                >
                  {selected === rate.method && (
                    <Check
                      className="text-background h-2.5 w-2.5"
                      strokeWidth={3}
                    />
                  )}
                </span>
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {rate.label}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {rate.description}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  rate.amountCents === 0 ? "text-green-500" : "text-foreground",
                )}
              >
                {rate.display}
              </span>
            </button>
          ))}
        </div>
      )}

      {freeNote && <p className="text-muted-foreground text-xs">{freeNote}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="border-border text-foreground hover:bg-muted flex h-12 items-center gap-2 rounded-md border px-5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back
        </button>
        <button
          type="button"
          disabled={!selectedRate || !!oversizedMsg}
          onClick={() =>
            selectedRate && onContinue(selected, selectedRate.amountCents)
          }
          className="bg-foreground text-background flex h-12 flex-1 items-center justify-center rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}
