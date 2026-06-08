"use client"

import { useState } from "react"
import type { PaymentVariant } from "@/lib/checkout"
import { cn } from "@/lib/utils"
import { CheckoutStepper } from "./checkout-stepper"
import { OrderSummary } from "./order-summary"
import { PaymentSection } from "./payment-section"
import { PaymentToast } from "./payment-toast"

const VARIANTS: { id: PaymentVariant; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "error", label: "Declined" },
  { id: "expired", label: "Expired card" },
]

export function CheckoutClient() {
  const [variant, setVariant] = useState<PaymentVariant>("default")
  const [toastOpen, setToastOpen] = useState(false)

  function handlePlaceOrder() {
    if (variant === "error") {
      setToastOpen(true)
    }
  }

  function selectVariant(next: PaymentVariant) {
    setVariant(next)
    setToastOpen(next === "error" ? toastOpen : false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Demo state switcher */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-muted-foreground">
          Preview state:
        </span>
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => selectVariant(v.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              variant === v.id
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mb-10">
        <CheckoutStepper activeStep="payment" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <PaymentSection variant={variant} />
        <OrderSummary variant={variant} onPlaceOrder={handlePlaceOrder} />
      </div>

      <PaymentToast open={toastOpen} onClose={() => setToastOpen(false)} />
    </div>
  )
}
