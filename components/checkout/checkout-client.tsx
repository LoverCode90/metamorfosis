"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import type { PaymentVariant, CheckoutStepId } from "@/lib/checkout"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/store/cart-context"
import { CheckoutStepper } from "./checkout-stepper"
import { OrderSummary } from "./order-summary"
import { PaymentSection } from "./payment-section"
import { PaymentToast } from "./payment-toast"
import { StepInfo, type InfoData } from "./steps/step-info"
import { StepShipping, type ShippingMethod } from "./steps/step-shipping"

// ---------------------------------------------------------------------------
// Preview-state toggles — only visible on the Payment step.
// ---------------------------------------------------------------------------
const VARIANTS: { id: PaymentVariant; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "error", label: "Declined" },
  { id: "expired", label: "Expired card" },
]

export function CheckoutClient() {
  const { items, totals, setView, placeOrder } = useCart()

  // Wizard step — starts at Step 2 ("info") per spec.
  const [wizardStep, setWizardStep] = useState<CheckoutStepId>("info")

  // Collected data from previous steps.
  const [infoData, setInfoData] = useState<InfoData | null>(null)

  // Payment demo variants (Step 4 only).
  const [variant, setVariant] = useState<PaymentVariant>("default")
  const [toastOpen, setToastOpen] = useState(false)

  // --------------- step handlers ---------------

  function handleInfoContinue(data: InfoData) {
    setInfoData(data)
    setWizardStep("shipping")
  }

  function handleShippingContinue(_method: ShippingMethod) {
    setWizardStep("payment")
  }

  function handleBackToInfo() {
    setWizardStep("info")
  }

  function handlePlaceOrder() {
    if (variant === "error") {
      setToastOpen(true)
      return
    }
    placeOrder({
      email: infoData?.email ?? "you@email.com",
      shipName: infoData
        ? `${infoData.firstName} ${infoData.lastName}`
        : "Valued Customer",
      shipAddress: infoData?.address ?? "United States",
    })
  }

  function selectVariant(next: PaymentVariant) {
    setVariant(next)
    if (next !== "error") setToastOpen(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">

      {/* Return to cart */}
      <button
        type="button"
        onClick={() => setView("cart")}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Return to cart
      </button>

      {/* Payment step preview-state toggles */}
      {wizardStep === "payment" && (
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
      )}

      {/* Stepper */}
      <div className="mb-10">
        <CheckoutStepper activeStep={wizardStep} />
      </div>

      {/* Main two-column grid */}
      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">

        {/* Left column — active step */}
        <div>
          {wizardStep === "info" && (
            <StepInfo onContinue={handleInfoContinue} />
          )}

          {wizardStep === "shipping" && infoData && (
            <StepShipping
              info={infoData}
              onContinue={handleShippingContinue}
              onBack={handleBackToInfo}
            />
          )}

          {wizardStep === "payment" && (
            <PaymentSection variant={variant} />
          )}
        </div>

        {/* Right column — always-visible order summary */}
        <OrderSummary
          items={items}
          totals={totals}
          wizardStep={wizardStep}
          variant={variant}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>

      {/* Floating error toast */}
      <PaymentToast open={toastOpen} onClose={() => setToastOpen(false)} />
    </div>
  )
}
